import { type PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { verifyEmailByToken, sendPasswordResetEmail } from "../emailFlows.js";
import { consumeToken } from "../../../mail/lib/tokens.js";
// ... other imports
import {
    signJwt,
    setAuthCookie,
    type Context,
} from "../lib/auth.js";
import { GraphQLError } from "graphql";
import { UserPublicFields } from "./const.js";



//MUTATIONS
//-----------------------------------------------------------------------------
export function createRequestPasswordResetMutation(prisma: PrismaClient) {
    return async (_: unknown, args: { email: string }, ctx: Context) => {
        const { email } = args;
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            sendPasswordResetEmail(user).catch((err: Error) =>
                console.error("[requestPasswordReset] failed to send email:", err)
            );
        }
        return true;
    };
}

export function createResetPasswordMutation(prisma: PrismaClient) {
    return async (_: unknown, args: { token: string; newPassword: string }, ctx: Context) => {
        const { token, newPassword } = args;

        const record = await consumeToken(token, "reset-password");
        if (!record) {
            throw new Error("Invalid or expired token");
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: record.userId },
            data: { passwordHash },
        });

        return true;
    };
}

export function createVerifyEmailMutation(prisma: PrismaClient) {
    return async (_: unknown,  args: { token: string }, ctx: Context) => {
        const { token } = args;

      const record = await consumeToken(token, "verify-email");
      if (!record) {
        throw new GraphQLError("Invalid or expired token", {
          extensions: { code: "EMAIL_VERIFY_TOKEN_INVALID" },
        });
      }

      const user = await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
        select: UserPublicFields,
      });

      const jwt = signJwt({ sub: user.id });
      setAuthCookie(ctx.res, jwt);

      return { user, token: jwt }; // 👈 AuthPayload
    };
}






