// apps/api/src/index.ts
import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import GraphQLJSON from "graphql-type-json";
import { gardenQueue } from "./queues/garden.queue.js";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
const prisma = new PrismaClient();
// --- GraphQL schema (SDL) ---
const typeDefs = `#graphql
  scalar JSON

  enum GardenPeriod { DAY WEEK MONTH YEAR }
  enum GardenStatus { PENDING READY FAILED }

  type Mood {
    valence: Float!
    arousal: Float!
    emotions: [KeyVal!]!
    tags: [String!]!
  }
  type KeyVal { key: String!, val: Float! }

  type Entry {
    id: ID!
    text: String!
    dayKey: String!
    createdAt: String!
    # For now we return a stub mood (since not persisted yet)
    mood: Mood!
  }

  type Garden {
    id: ID!
    period: GardenPeriod!
    periodKey: String!
    status: GardenStatus!
    imageUrl: String
    palette: JSON
    seedValue: Int!
    summary: String
    progress: Int!        # <-- NEW: 0..100
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    garden(period: GardenPeriod!, periodKey: String!): Garden
  }

  type Mutation {
    upsertEntry(text: String!, songUrl: String, dayKey: String!): Entry!
    requestGarden(period: GardenPeriod!, periodKey: String!): Garden!
  }
`;
// Convert DB record (palette is a string in SQLite) to GraphQL shape
function mapGardenOut(garden) {
    if (!garden)
        return null;
    return {
        ...garden,
        palette: garden.palette ? JSON.parse(garden.palette) : null,
    };
}
const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        garden: async (_parent, args, _ctx) => {
            const { period, periodKey } = args;
            const g = await prisma.garden.findUnique({
                where: { period_periodKey: { period, periodKey } },
            });
            return mapGardenOut(g);
        },
    },
    Mutation: {
        upsertEntry: async (_parent, args, _ctx) => {
            const { text, songUrl, dayKey } = args;
            const entry = await prisma.entry.create({
                data: { text, songUrl: songUrl ?? undefined, dayKey },
            });
            return {
                ...entry,
                mood: {
                    valence: 0.2,
                    arousal: 0.6,
                    emotions: [{ key: "stress", val: 0.7 }],
                    tags: ["study", "exam"],
                },
            };
        },
        requestGarden: async (_parent, args, _ctx) => {
            const { period, periodKey } = args;
            const seedValue = Math.floor(Math.random() * 1e9);
            const pending = await prisma.garden.upsert({
                where: { period_periodKey: { period, periodKey } },
                update: {
                    status: "PENDING",
                    imageUrl: null,
                    summary: "Your garden is growing…",
                    palette: JSON.stringify({ primary: "#88c0ff" }),
                    seedValue,
                    progress: 0, // reset progress on new request
                },
                create: {
                    period,
                    periodKey,
                    status: "PENDING",
                    imageUrl: null,
                    summary: "Your garden is growing…",
                    palette: JSON.stringify({ primary: "#88c0ff" }),
                    seedValue,
                    progress: 0,
                },
            });
            await gardenQueue.add("generate", {
                gardenId: pending.id,
                period,
                periodKey,
                seedValue,
            });
            return mapGardenOut(pending);
        },
    },
};
async function main() {
    const app = express();
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));
    app.use(express.json());
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    app.use("/graphql", expressMiddleware(server, {
        context: async () => ({}),
    }));
    app.get("/healthz", (_req, res) => res.send("ok"));
    app.listen(4000, () => {
        console.log("GraphQL on http://localhost:4000/graphql");
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
