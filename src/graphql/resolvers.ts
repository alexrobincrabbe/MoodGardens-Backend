import GraphQLJSON from "graphql-type-json";
import { mapGardenOut } from "../modules/gardens/lib/gardens.js";
import { requireUser, type Context } from "../modules/users/lib/auth.js";
import { PrismaClient, GardenPeriod } from "@prisma/client";
import { createQueries } from "./queries.js";
import { createMutations } from "./mutations.js";

type DiaryEntryParent = { dayKey: string };

export function createResolvers(prisma: PrismaClient) {
    return {
        JSON: GraphQLJSON,

        DiaryEntry: {
            garden: async (parent: DiaryEntryParent, _args: unknown, ctx: Context) => {
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
