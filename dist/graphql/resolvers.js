import GraphQLJSON from "graphql-type-json";
import { mapGardenOut } from "../lib/gardens.js";
import { requireUser } from "../lib/auth/auth.js";
import { GardenPeriod } from "@prisma/client";
import { createQueries } from "./queries.js";
import { createMutations } from "./mutations.js";
export function createResolvers(prisma) {
    return {
        JSON: GraphQLJSON,
        DiaryEntry: {
            garden: async (parent, _args, ctx) => {
                const userId = requireUser(ctx);
                const garden = await prisma.garden.findUnique({
                    where: {
                        userId_period_periodKey: {
                            userId,
                            period: GardenPeriod.DAY,
                            periodKey: parent.dayKey,
                        },
                    },
                });
                return mapGardenOut(garden);
            },
        },
        Query: createQueries(prisma),
        Mutation: createMutations(prisma)
    };
}
