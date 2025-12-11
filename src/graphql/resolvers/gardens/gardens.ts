import { type Context, requireUser } from "../../../auth/lib/auth.js";
import { Services } from "../../services.js";
import { throwInternalError } from "../../../lib/errors/GraphQLErrors.js";
import { logger } from "../../../lib/logger.js";
import { checkResolverMultipleRateLimits } from "../../../lib/rateLimit.js";
import type {
    GardenQueryArgs,
    GardenPeriodQueryArgs,
    GardensByMonthArgs,
    GardenArgs,
    RegenerateGardenArgs,
} from "../../../types.js";

// QUERIES
//--------------------------------------------------------------------------------------
// Used for fetching a garden eg. for a specific diary entry.
export function createGardenQuery(services: Services) {
    return async (_: unknown, args: GardenQueryArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.gardenService.getGarden({
            userId,
            period: args.period,
            periodKey: args.periodKey,
        });
    };
}

// Fetches all gardens for a given user by period TYPE, ie week/month/year
export function createGardensByPeriodQuery(services: Services) {
    return async (_: unknown, args: GardenPeriodQueryArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.gardenService.getGardensByPeriod({
            userId,
            period: args.period,
        });
    };
}

// Fetches all (period type: DAY) gardens for a given user for a given month, eg. Feb 2025
export function createGardensByMonthQuery(services: Services) {
    return async (_: unknown, args: GardensByMonthArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.gardenService.getGardensByMonth({
            userId,
            monthKey: args.monthKey,
        });
    };
}

// MUTATIONS
//-------------------------------------------------------------------------

export function createRequestGenerateGardenMutation(services: Services) {
    return async (_: unknown, args: GardenArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        
        // Rate limit: 5 requests / 15 min and 25 / 24h per user
        await checkResolverMultipleRateLimits(
            userId,
            ctx.req,
            "garden:generate",
            [
                { limit: 5, windowSeconds: 15 * 60 }, // 5 per 15 minutes
                { limit: 25, windowSeconds: 24 * 60 * 60 }, // 25 per 24 hours
            ]
        );
        
        const user = await services.userRepository.findUserSettings(userId);
        if (!user) {
            logger.error("User not found for garden generation", { userId });
            throwInternalError("Unable to generate garden. Your account settings could not be found.");
        }
        return services.gardenService.requestGenerateGarden({
            userId,
            period: args.period,
            periodKey: args.periodKey ?? null,
            gardenType: args.gardenType,
            userTimezone: user.timezone,
            userDayRolloverHour: user.dayRolloverHour,
        });
    };
}

export function createRegenerateGardenMutation(services: Services) {
    return async (_: unknown, args: RegenerateGardenArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.gardenService.regenerateGarden({
            userId,
            gardenId: args.gardenId,
        });
    };
}
