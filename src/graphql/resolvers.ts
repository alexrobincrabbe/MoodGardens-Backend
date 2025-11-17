import GraphQLJSON from "graphql-type-json";
import bcrypt from "bcryptjs";
import { gardenQueue } from "../queues/garden.queue.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import {
    signJwt,
    setAuthCookie,
    clearAuthCookie,
    requireUser,
    type Context,
} from "../lib/auth.js";
import { PrismaClient, Prisma, GardenPeriod, GardenStatus } from "@prisma/client";
import { computeDiaryDayKey } from "../utils/diaryDay.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"; // or whatever you’re using
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET!; // your existing secret

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
        throw new GraphQLError("Could not verify Google account.", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        displayName: payload.name ?? payload.email.split("@")[0],
    };
}


type GardenArgs = { period: GardenPeriod; periodKey: string };
type CreateDiaryEntryArgs = { text: string };
type RegisterArgs = { email: string; displayName: string; password: string };
type LoginArgs = { email: string; password: string };
type UpdateDisplayNameArgs = { displayName: string };
type DiaryEntryParent = { dayKey: string };
type UpdateUserSettingsArgs = {
    timezone: string;
    dayRolloverHour: number;
};

type UpdateProfileArgs = {
    email: string;
    displayName: string;
}

const UserPublicFields = {
    id: true,
    email: true,
    displayName: true,
    createdAt: true,
    timezone: true,
    dayRolloverHour: true,
    notifyWeeklyGarden: true,
    notifyMonthlyGarden: true,
    notifyYearlyGarden: true,
} as const;


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

        Query: {
            user: async (_: unknown, __: unknown, ctx: Context) => {
                if (!ctx.userId) return null;
                return prisma.user.findUnique({
                    where: { id: ctx.userId },
                    select: UserPublicFields,
                });
            },

            diaryEntry: async (_: unknown, args: { dayKey: string }, ctx: Context) => {
                const userId = requireUser(ctx);
                return prisma.diaryEntry.findUnique({
                    where: { userId_dayKey: { userId, dayKey: args.dayKey } },
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },

            paginatedDiaryEntries: async (
                _: unknown,
                args: { limit: number; offset: number },
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);
                return prisma.diaryEntry.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: Math.min(100, Math.max(1, args.limit)),
                    skip: Math.max(0, args.offset),
                    select: { id: true, text: true, dayKey: true, createdAt: true },
                });
            },

            garden: async (_: unknown, args: GardenArgs, ctx: Context) => {
                const userId = requireUser(ctx);
                const g = await prisma.garden.findUnique({
                    where: {
                        userId_period_periodKey: {
                            userId,
                            period: args.period,
                            periodKey: args.periodKey,
                        },
                    },
                });
                return mapGardenOut(g);
            },

            gardensByMonth: async (
                _: unknown,
                args: { monthKey: string },
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);
                const gardens = await prisma.garden.findMany({
                    where: {
                        userId,
                        period: GardenPeriod.DAY,
                        periodKey: { startsWith: `${args.monthKey}-` },
                    },
                    orderBy: { periodKey: "asc" },
                });

                return gardens.map(mapGardenOut);
            },
            currentDiaryDayKey: async (_: unknown, __: unknown, ctx: Context) => {
                const userId = requireUser(ctx); // or return null if you want it anonymous-safe

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { timezone: true, dayRolloverHour: true },
                });

                if (!user) throw new Error("User not found");

                return computeDiaryDayKey(
                    user.timezone ?? "UTC",
                    user.dayRolloverHour ?? 0
                );
            },
        },

        Mutation: {
            register: async (_: unknown, args: RegisterArgs, ctx: Context) => {
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
            },

            login: async (_: unknown, args: LoginArgs, ctx: Context) => {
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
            },

            loginWithGoogle: async (
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

                // Issue the same JWT you use for normal login/register
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);

                return { user };
            },

            logout: async (_: unknown, __: unknown, ctx: Context) => {
                clearAuthCookie(ctx.res);
                return true;
            },


            updateDisplayName: async (
                _: unknown,
                args: UpdateDisplayNameArgs,
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);
                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: { displayName: args.displayName },
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
                return updated;
            },

            createDiaryEntry: async (
                _: unknown,
                args: CreateDiaryEntryArgs,
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { timezone: true, dayRolloverHour: true },
                });

                if (!user) {
                    throw new Error("User not found");
                }

                const dayKey = computeDiaryDayKey(
                    user.timezone ?? "UTC",
                    user.dayRolloverHour ?? 0,
                );

                const diaryEntry = await prisma.diaryEntry.create({
                    data: { text: args.text, dayKey, userId },
                });

                return diaryEntry;
            },

            updateUserSettings: async (
                _: unknown,
                args: UpdateUserSettingsArgs,
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);

                // Clamp rollover hour to [0, 23] just to be safe
                const safeHour = Math.min(23, Math.max(0, Math.floor(args.dayRolloverHour)));

                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: {
                        timezone: args.timezone,
                        dayRolloverHour: safeHour,
                    },
                    select: UserPublicFields,
                });

                return updated;
            },

            updateUserProfile: async (_: unknown, args: UpdateProfileArgs, ctx: Context) => {
                const userId = requireUser(ctx);

                const email = args.email.trim();
                const displayName = args.displayName.trim();

                if (!email) {
                    throw new GraphQLError("Email cannot be empty.", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }
                if (!displayName) {
                    throw new GraphQLError("Display name cannot be empty.", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }

                try {
                    const updated = await prisma.user.update({
                        where: { id: userId },
                        data: { email, displayName },
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    });

                    return updated;
                } catch (err: any) {
                    console.error("[updateUserProfile] prisma error:", err);

                    // P2002 = unique constraint violation
                    if (err.code === "P2002") {
                        const target = err.meta?.target;
                        const isEmailTarget =
                            typeof target === "string"
                                ? target.includes("email")
                                : Array.isArray(target) && target.includes("email");

                        if (isEmailTarget) {
                            throw new GraphQLError("That email address is already in use.", {
                                extensions: { code: "BAD_USER_INPUT" },
                            });
                        }
                    }

                    throw new GraphQLError("Could not update profile.", {
                        extensions: { code: "INTERNAL_SERVER_ERROR" },
                    });
                }
            }

            ,

            changePassword: async (
                _: unknown,
                args: { currentPassword: string; newPassword: string },
                ctx: Context
            ) => {
                const userId = requireUser(ctx);

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { passwordHash: true },
                });

                if (!user || !user.passwordHash) {
                    throw new GraphQLError("User not found.", {
                        extensions: { code: "UNAUTHENTICATED" },
                    });
                }

                // 1. Check current password
                const ok = await bcrypt.compare(args.currentPassword, user.passwordHash);
                if (!ok) {
                    throw new GraphQLError("Your current password is incorrect.", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }

                // 2. Basic strength check
                if (args.newPassword.length < 8) {
                    throw new GraphQLError(
                        "New password must be at least 8 characters long.",
                        { extensions: { code: "BAD_USER_INPUT" } }
                    );
                }

                // 3. Hash and save new password
                const newHash = await bcrypt.hash(args.newPassword, 12);

                await prisma.user.update({
                    where: { id: userId },
                    data: { passwordHash: newHash },
                });

                return true;
            }
            ,


            requestGenerateGarden: async (_: unknown, args: GardenArgs, ctx: Context) => {
                const userId = requireUser(ctx);

                try {
                    // 1) Load user settings for timezone + rollover
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { timezone: true, dayRolloverHour: true },
                    });

                    if (!user) {
                        console.error("[requestGenerateGarden] user not found:", { userId });
                        throw new Error("User not found");
                    }

                    // 2) Decide which periodKey to actually use
                    let periodKey: string;

                    if (args.period === "DAY") {
                        periodKey = computeDiaryDayKey(
                            user.timezone ?? "UTC",
                            user.dayRolloverHour ?? 0
                        );
                        console.log("[requestGenerateGarden] computed DAY periodKey:", periodKey);
                    } else {
                        if (!args.periodKey) {
                            console.error(
                                "[requestGenerateGarden] missing periodKey for non-DAY period:",
                                args
                            );
                            throw new Error("periodKey is required for non-DAY gardens");
                        }
                        periodKey = args.periodKey;
                    }

                    // 3) Use the *computed* periodKey everywhere from here on
                    let pending = await prisma.garden.upsert({
                        where: {
                            userId_period_periodKey: {
                                userId,
                                period: args.period,
                                periodKey,
                            },
                        },
                        update: {
                            status: GardenStatus.PENDING,
                            imageUrl: null,
                            summary: "Your garden is growing…",
                            progress: 0,
                        },
                        create: {
                            userId,
                            period: args.period,
                            periodKey,
                            status: GardenStatus.PENDING,
                            imageUrl: null,
                            summary: "Your garden is growing…",
                            progress: 0,
                            shareId: generateShareId(),
                        },
                    });

                    if (!pending.shareId) {
                        pending = await prisma.garden.update({
                            where: { id: pending.id },
                            data: { shareId: generateShareId() },
                        });
                    }

                    await gardenQueue.add("generate", {
                        gardenId: pending.id,
                        period: args.period,
                        periodKey,
                    });

                    const result = mapGardenOut(pending);

                    return result;
                } catch (err) {
                    console.error("[requestGenerateGarden] ERROR:", err);
                    throw err;
                }
            },

        },
    };
}
