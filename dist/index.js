// apps/api/src/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";
import { prisma } from "./prismaClient.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { createResolvers } from "./graphql/resolvers.js";
import { mountShareMeta } from "./routes/shareMeta.js";
import { JWT_SECRET, PORT, corsOptions, } from "./config/settings.js";
import { setupAggregationJobs } from "./bootstrapAggregationJobs.js";
import { devRouter } from "./routes/dev.routes.js";
import { setupAdminPanel } from "./admin/admin.js";
async function main() {
    //Start app
    const app = express();
    //set up jobs
    await setupAggregationJobs();
    //Log requests
    app.use((req, _res, next) => {
        console.log("[API]", req.method, req.url);
        next();
    });
    //app settings
    app.set("trust proxy", 1);
    app.use(cookieParser());
    app.use(express.json());
    // Dev routes
    app.use("/dev", devRouter);
    // Mount admin panel
    setupAdminPanel(app);
    //CORS
    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));
    // Public JSON used by the frontend /share/:id page
    mountShareMeta(app, prisma);
    // Create Apollo/graphQL server
    const server = new ApolloServer({
        typeDefs,
        resolvers: createResolvers(prisma),
    });
    await server.start();
    // Auth
    app.use("/graphql", expressMiddleware(server, {
        context: async ({ req, res }) => {
            let userId = null;
            const token = req.cookies?.["mg_jwt"];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded?.sub ?? null;
                }
                catch {
                    userId = null;
                }
            }
            return { userId, req, res };
        },
    }));
    // Health check
    app.get("/healthz", (_req, res) => res.send("ok"));
    // Catch errors
    app.use((req, res) => {
        console.log("[API] 404", req.method, req.url);
        res.status(404).json({ error: "not_found", path: req.url });
    });
    // listen on port
    app.listen(PORT, () => {
        console.log(`GraphQL on http://0.0.0.0:${PORT}/graphql`);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
