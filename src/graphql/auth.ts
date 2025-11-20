import { type PrismaClient } from "@prisma/client";
import { UserPublicFields } from "./const.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import {
    signJwt,
    setAuthCookie,
    clearAuthCookie,
    type Context,
} from "../lib/auth/auth.js";
import { verifyGoogleIdToken } from "../lib/auth/verify-google-auth-token.js";

type RegisterArgs = { email: string; displayName: string; password: string };
type LoginArgs = { email: string; password: string };

//QUERIES
//-----------------------------------------------------------------------------
export function createUserQuery(prisma: PrismaClient) {
    return async (_: unknown, __: unknown, ctx: Context) => {
        if (!ctx.userId) return null;

        return prisma.user.findUnique({
            where: { id: ctx.userId },
            select: UserPublicFields,
        });
    };
}

//MUTATIONS
//-------------------------------------------------------------------------------
export function createRegisterMutation(prisma: PrismaClient) {
    return (
        async (_: unknown, args: RegisterArgs, ctx: Context) => {
            const existing = await prisma.user.findUnique({
                where: { email: args.email },
            });
            if (existing) throw new Error("Email already in use");

            const passwordHash = await bcrypt.hash(args.password, 12);
            const user = await prisma.user.create({
                data: {
                    email: args.email,
                    passwordHash,
                    displayName: args.displayName,
                },
                select: UserPublicFields,
            });
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        }
    )
}

export function createLoginMutation(prisma: PrismaClient) {
    return (
        async (_: unknown, args: LoginArgs, ctx: Context) => {
            const u = await prisma.user.findUnique({
                where: { email: args.email },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    displayName: true,
                    passwordHash: true,
                },
            });

            if (!u || !u.passwordHash) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }

            const ok = await bcrypt.compare(args.password, u.passwordHash);
            if (!ok) {
                throw new GraphQLError("Invalid credentials", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }

            const user = {
                id: u.id,
                email: u.email,
                createdAt: u.createdAt,
                displayName: u.displayName,
            };

            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        }
    )
}

export function createLoginWithGoogleMutation(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: { idToken: string },
            ctx: Context
        ) => {
            const { idToken } = args;
            const { googleId, email, displayName } = await verifyGoogleIdToken(idToken);

            // Try to find existing user by googleId or email
            const existingByGoogle = await prisma.user.findUnique({
                where: { googleId },
                select: UserPublicFields,
            });

            let user = existingByGoogle;

            if (!user) {
                const existingByEmail = await prisma.user.findUnique({
                    where: { email },
                    select: UserPublicFields,
                });

                if (existingByEmail) {
                    // Link Google to existing account
                    user = await prisma.user.update({
                        where: { id: existingByEmail.id },
                        data: { googleId },
                        select: UserPublicFields,
                    });
                } else {
                    // Create new user, no passwordHash
                    user = await prisma.user.create({
                        data: {
                            email,
                            displayName,
                            googleId,
                        },
                        select: UserPublicFields,
                    });
                }
            }
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user };
        }
    )
}

export function createLogoutMutation(prisma: PrismaClient) {
    return(
        async (_: unknown, __: unknown, ctx: Context) => {
                clearAuthCookie(ctx.res);
                return true;
            }
    )
}
