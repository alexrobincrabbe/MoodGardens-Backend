// apps/api/src/index.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { typeDefs } from "./graphql/typeDefs.js";
import { createResolvers } from "./graphql/resolvers.js";
import { mountShareMeta } from "./routes/shareMeta.js";

import {
  JWT_SECRET,
  PUBLIC_ORIGIN,
  PORT,
  corsOptions,
} from "./config/settings.js";

type Context = {
  userId: string | null;
  req: express.Request;
  res: express.Response;
};

const prisma = new PrismaClient();

async function main() {
  const app = express();

  // (optional) simple request logger for dev
  app.use((req, _res, next) => {
    console.log("[API]", req.method, req.url);
    next();
  });

  app.set("trust proxy", 1);
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());

  // Public JSON used by the frontend /share/:id page
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

  // (optional) catch-all 404 to keep misses visible in dev
  app.use((req, res) => {
    console.log("[API] 404", req.method, req.url);
    res.status(404).json({ error: "not_found", path: req.url });
  });

  app.listen(PORT, () => {
    console.log(`GraphQL on http://0.0.0.0:${PORT}/graphql`);
    console.log(`Public shares on ${PUBLIC_ORIGIN}/share/:shareId`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
