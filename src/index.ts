import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prismaClient.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { createResolvers } from "./graphql/resolvers.js";
import { mountShareMeta } from "./routes/shareMeta.js";
import { authRouter } from "./routes/auth.js"; // export default router
import {
    JWT_SECRET,
    PORT,
    corsOptions,
} from "./config/settings.js";
import { setupAggregationJobs } from "./bootstrapAggregationJobs.js";
import { devRouter } from "./routes/dev.routes.js";
import { setupAdminPanel } from "./admin/admin.js";
import { stripe } from "./lib/stripe.js";
import { billingRouter } from "./routes/billing.routes.js";

import type Stripe from "stripe";

type Context = {
    userId: string | null;
    req: express.Request;
    res: express.Response;
};

async function main() {
    const app = express();
    app.post(
        "/billing/webhook",
        express.raw({ type: "application/json" }),  // (1) webhook needs raw body
        async (req, res) => {
            const sig = req.headers["stripe-signature"];

            let event;

            try {
                // (2) Construct the Stripe event from raw body + signature + secret
                event = stripe.webhooks.constructEvent(
                    req.body,
                    sig as string,
                    process.env.STRIPE_WEBHOOK_SECRET!
                );
            } catch (err: any) {
                console.error("⚠️ Webhook signature verification failed:", err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            // ------------------------------------------------------------
            // ⭐ THIS is the part I meant:
            // “In your /billing/webhook route, after constructing event”
            // ------------------------------------------------------------

            try {
                switch (event.type) {
                    case "customer.subscription.created":
                    case "customer.subscription.updated": {
                        const subscription = event.data.object;
                        const customer = subscription.customer;

                        const customerId =
                            typeof customer === "string"
                                ? customer
                                : customer.id; // works for Customer & DeletedCustomer
                        if (!customerId) {
                            console.warn("[billing] subscription without customerId?", subscription.id);
                            break;
                        }
                        // Find the user in your database with this customer ID
                        const user = await prisma.user.findFirst({
                            where: { stripeCustomerId: customerId },
                        });

                        if (user) {
                            const isActive =
                                subscription.status === "active" ||
                                subscription.status === "trialing";

                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    isPremium: isActive,
                                    premiumSince: isActive ? new Date() : user.premiumSince,
                                },
                            });

                            console.log("[billing] Subscription updated for:", user.email);
                        }
                        break;
                    }

                    case "customer.subscription.deleted": {
                        const subscription = event.data.object;
                        const customer = subscription.customer;
                        const customerId =
                            typeof customer === "string" ? customer : customer.id;

                        if (!customerId) break;

                        const user = await prisma.user.findFirst({
                            where: { stripeCustomerId: customerId },
                        });

                        if (user) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    isPremium: false,
                                    premiumSince: null,
                                },
                            });

                            console.log("[billing] Subscription cancelled for:", user.email);
                        }
                        break;
                    }

                    default:
                        console.log("🔔 Event received:", event.type);
                        break;
                }
            } catch (err) {
                console.error("[billing] Error handling webhook event:", err);
                return res.status(500).send("Webhook handler failed");
            }

            // Stripe needs a 2xx to confirm receipt
            res.json({ received: true });
        }
    );

    console.log("checking CI/CD pipeline -3nd run")
    await setupAggregationJobs();

    // Log requests
    app.use((req, _res, next) => {
        console.log("[API]", req.method, req.url);
        next();
    });

    // Trust proxy (needed for cookies behind Azure)
    app.set("trust proxy", 1);
    // Admin panel
    setupAdminPanel(app);
    // ---- CORS FIRST ----
    app.use(cors(corsOptions));

    // Explicitly ensure credentials header is always set
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });

    // Handle preflight
    app.options("*", cors(corsOptions));
    // ---- END CORS BLOCK ----

    app.use(cookieParser());
    app.use(express.json());
    app.use("/billing", billingRouter);
    app.use("/auth", authRouter);
    // Dev routes
    app.use("/dev", devRouter);



    // Public JSON for /share/:id
    mountShareMeta(app, prisma);

    const server = new ApolloServer({
        typeDefs,
        resolvers: createResolvers(prisma),
    });
    await server.start();

    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: async ({ req, res }): Promise<Context> => {
                let userId: string | null = null;
                const token = req.cookies?.["mg_jwt"];
                if (token) {
                    try {
                        const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
                        userId = decoded?.sub ?? null;
                    } catch {
                        userId = null;
                    }
                }
                return { userId, req, res };
            },
        })
    );

    app.get("/healthz", (_req, res) => res.send("ok"));

    app.use((req, res) => {
        console.log("[API] 404", req.method, req.url);
        res.status(404).json({ error: "not_found", path: req.url });
    });

    app.listen(PORT, () => {
        console.log(`GraphQL on http://0.0.0.0:${PORT}/graphql`);
    });
}


main().catch((err) => {
    console.error(err);
    process.exit(1);
});
