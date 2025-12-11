import { requireUser, type Context } from "../../../auth/lib/auth.js";
import { Services } from "../../services.js";
import type { AddRegenTokensArgs } from "../../../types.js";

export function createMarkUserPremiumFromMobileMutation(services: Services) {
    return async (_: unknown, __: unknown, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.userService.markPremium(userId);
    };
}

export function createAddRegenTokensFromMobileMutation(services: Services) {
    return async (_: unknown, args: AddRegenTokensArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.userService.addRegenTokens({
            userId,
            amount: args.amount,
        });
    };
}
