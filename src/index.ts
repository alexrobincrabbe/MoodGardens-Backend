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
import {
    JWT_SECRET,
    PORT,
    corsOptions,
} from "./config/settings.js";
import { setupAggregationJobs } from "./bootstrapAggregationJobs.js";
import { devRouter } from "./routes/dev.routes.js";
import { setupAdminPanel } from "./admin/admin.js";


type Context = {
    userId: string | null;
    req: express.Request;
    res: express.Response;
};

async function main() {
    const app = express();
    console.log("checking CI/CD pipeline -3nd run")
    await setupAggregationJobs();

    // Log requests
    app.use((req, _res, next) => {
        console.log("[API]", req.method, req.url);
        next();
    });

    // Trust proxy (needed for cookies behind Azure)
    app.set("trust proxy", 1);

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

    // Dev routes
    app.use("/dev", devRouter);

    // Admin panel
    setupAdminPanel(app);

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
