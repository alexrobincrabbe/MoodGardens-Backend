import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "../../../auth/emailFlows.js";
import { consumeToken } from "../../../mail/lib/tokens.js";
import {
    signJwt,
    setAuthCookie,
    type Context,
} from "../../../auth/lib/auth.js";
import { throwBadInput } from "../../../lib/errors/GraphQLErrors.js";
import { logger } from "../../../lib/logger.js";
import { Services } from "../../services.js";
import type {
    RequestPasswordResetArgs,
    ResetPasswordArgs,
    VerifyEmailArgs,
} from "../../../types.js";

//MUTATIONS
//-----------------------------------------------------------------------------
export function createRequestPasswordResetMutation(services: Services) {
    return async (_: unknown, args: RequestPasswordResetArgs, ctx: Context) => {
        const { email } = args;
        const user = await services.userRepository.findByEmail(email);
        if (user) {
            sendPasswordResetEmail(user).catch((err: Error) =>
                logger.error("Failed to send password reset email", err, { email })
            );
        }
        return true;
    };
}

export function createResetPasswordMutation(services: Services) {
    return async (_: unknown, args: ResetPasswordArgs, ctx: Context) => {
        const { token, newPassword } = args;

        const record = await consumeToken(token, "reset-password");
        if (!record) {
            throw new Error("Invalid or expired token");
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await services.userRepository.update({
            id: record.userId,
            passwordHash,
        });

        return true;
    };
}

export function createVerifyEmailMutation(services: Services) {
    return async (_: unknown, args: VerifyEmailArgs, ctx: Context) => {
        const { token } = args;

        const record = await consumeToken(token, "verify-email");
        if (!record) {
            throwBadInput("Invalid or expired token", {
                code: "EMAIL_VERIFY_TOKEN_INVALID",
            });
        }

        const user = await services.userRepository.update({
            id: record.userId,
            emailVerified: true,
        });

        const jwt = signJwt({ sub: user.id });
        setAuthCookie(ctx.res, jwt);

        return { user, token: jwt }; // 👈 AuthPayload
    };
}
