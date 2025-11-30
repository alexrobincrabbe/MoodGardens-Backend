import { type PrismaClient } from "@prisma/client";
import { UserPublicFields } from "./const.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import {
    signJwt,
    setAuthCookie,
    clearAuthCookie,
    type Context,
} from "../lib/auth.js";
import { verifyGoogleIdToken } from "../lib/verify-google-auth-token.js";
import { sendVerificationEmail } from "../emailFlows.js";


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
function isValidEmail(email: string) {
    // very simple but good enough
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createRegisterMutation(prisma: PrismaClient) {
    return async (_: unknown, args: RegisterArgs, ctx: Context) => {
        const email = args.email?.trim();
        const password = args.password ?? "";
        const displayName = args.displayName?.trim();

        // Basic presence validation
        if (!email || !password || !displayName) {
            throw new GraphQLError(
                "Email, password and display name are required.",
                { extensions: { code: "BAD_USER_INPUT" } }
            );
        }

        // Email format
        if (!isValidEmail(email)) {
            throw new GraphQLError("Please enter a valid email address.", {
                extensions: { code: "BAD_USER_INPUT" },
            });
        }

        // Password length (tweak as you like)
        if (password.length < 8) {
            throw new GraphQLError(
                "Password must be at least 8 characters long.",
                { extensions: { code: "BAD_USER_INPUT" } }
            );
        }

        // Email already in use
        const existing = await prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new GraphQLError("Email already in use.", {
                extensions: { code: "EMAIL_IN_USE" },
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName,
                emailVerified: false,
            },
            select: UserPublicFields,
        });

        // send verification email (you already had this)
        sendVerificationEmail(user).catch((err) =>
            console.error("[signup] failed to send verification email:", err)
        );

        // NOTE: no login here
        return { user };
    };
}

export function createLoginMutation(prisma: PrismaClient) {
    return (
        async (_: unknown, args: LoginArgs, ctx: Context) => {
            console.log("[login] attempt from", ctx.req.headers["user-agent"]);
            console.log("[login] email arg:", JSON.stringify(args.email));

            const u = await prisma.user.findUnique({
                where: { email: args.email },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    displayName: true,
                    passwordHash: true,
                    emailVerified: true,
                },
            });

            console.log("[login] found user:", u && {
                id: u.id,
                email: u.email,
                emailVerified: u.emailVerified,
                hasPassword: !!u.passwordHash,
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

            if (!u.emailVerified) {
                throw new GraphQLError("Please verify your email before logging in.", {
                    extensions: { code: "EMAIL_NOT_VERIFIED" },
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
            return { user, token };
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
                        data: { googleId, emailVerified: true },
                        select: UserPublicFields,
                    });
                } else {
                    // Create new user, no passwordHash
                    user = await prisma.user.create({
                        data: {
                            email,
                            displayName,
                            googleId,
                            emailVerified: true,
                        },
                        select: UserPublicFields,
                    });
                }
            }
            const token = signJwt({ sub: user.id });
            setAuthCookie(ctx.res, token);
            return { user, token };
        }
    )
}

export function createLogoutMutation(prisma: PrismaClient) {
    return (
        async (_: unknown, __: unknown, ctx: Context) => {
            clearAuthCookie(ctx.res);
            return true;
        }
    )
}
