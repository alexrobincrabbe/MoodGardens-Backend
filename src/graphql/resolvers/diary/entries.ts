import { type Context, requireUser } from "../../../auth/lib/auth.js";
import { Services } from "../../services.js";
import { throwInternalError } from "../../../lib/errors/GraphQLErrors.js";
import { checkResolverRateLimit } from "../../../lib/rateLimit.js";
import type {
    CreateDiaryEntryArgs,
    DiaryEntryQueryArgs,
    PaginatedDiaryEntriesArgs,
} from "../../../types.js";

// QUERIES
//-----------------------------------------------------------------------------------------
export function createDairyEntryQuery(services: Services) {
    return async (_: unknown, args: DiaryEntryQueryArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.diaryService.getDiaryEntry({
            userId,
            dayKey: args.dayKey,
        });
    };
}

export function createPaginatedEntriesQuery(services: Services) {
    return async (
        _: unknown,
        args: PaginatedDiaryEntriesArgs,
        ctx: Context
    ) => {
        const userId = requireUser(ctx);
        return services.diaryService.getPaginatedEntries({
            userId,
            limit: args.limit,
            offset: args.offset,
        });
    };
}

export function createCurrentDayKeyQuery(services: Services) {
    return async (_: unknown, __: unknown, ctx: Context) => {
        const userId = requireUser(ctx);
        try {
            return await services.diaryService.getCurrentDayKey(userId);
        } catch (err) {
            throwInternalError("Unable to retrieve current day key. Your user settings may be missing.");
        }
    };
}

export function createCreateDiaryEntryMutation(services: Services) {
    return async (_: unknown, args: CreateDiaryEntryArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        
        // Rate limit: 30 requests / 5 min per user
        await checkResolverRateLimit(
            userId,
            ctx.req,
            "diary:create",
            30,
            5 * 60 // 5 minutes
        );
        
        try {
            return await services.diaryService.createDiaryEntry({
                userId,
                text: args.text,
            });
        } catch (err) {
            throwInternalError("Unable to save your diary entry. Please try again in a moment.");
        }
    };
}
