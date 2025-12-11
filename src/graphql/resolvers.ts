import GraphQLJSON from "graphql-type-json";
import { mapGardenOut } from "../modules/gardens/lib/gardens.js";
import { requireUser, type Context } from "../auth/lib/auth.js";
import { PrismaClient, GardenPeriod } from "@prisma/client";
import { createQueries } from "./queries.js";
import { createMutations } from "./mutations.js";
import { Services } from "./services.js";
import type { DiaryEntryParent } from "../types.js";

export function createResolvers(prisma: PrismaClient) {
    // Create services once at the top level
    const services = new Services(prisma);

    return {
        JSON: GraphQLJSON,

        DiaryEntry: {
            garden: async (parent: DiaryEntryParent, _args: unknown, ctx: Context) => {
                const userId = requireUser(ctx);
                return services.gardenService.getGarden({
                    userId,
                    period: GardenPeriod.DAY,
                    periodKey: parent.dayKey,
                });
            },
        },

        Query: createQueries(services),

        Mutation: createMutations(services)
    };
}
