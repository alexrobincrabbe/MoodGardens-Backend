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
import { PrismaClient, GardenPeriod, GardenStatus } from "@prisma/client";

type GardenArgs = { period: GardenPeriod; periodKey: string };
type CreateDiaryEntryArgs = { text: string; songUrl?: string | null; dayKey: string };
type RegisterArgs = { email: string; displayName: string; password: string };
type LoginArgs = { email: string; password: string };
type UpdateDisplayNameArgs = { displayName: string };
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

        Query: {
            user: async (_: unknown, __: unknown, ctx: Context) => {
                if (!ctx.userId) return null;
                return prisma.user.findUnique({
                    where: { id: ctx.userId },
                    select: { id: true, email: true, createdAt: true, displayName: true },
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
                    select: { id: true, email: true, createdAt: true, displayName: true },
                });
                const token = signJwt({ sub: user.id });
                setAuthCookie(ctx.res, token);
                return { user };
            },

            login: async (_: unknown, args: LoginArgs, ctx: Context) => {
                const u = await prisma.user.findUnique({
                    where: { email: args.email },
                });
                if (!u) throw new Error("Invalid credentials");

                const ok = await bcrypt.compare(args.password, u.passwordHash);
                if (!ok) throw new Error("Invalid credentials");

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

            logout: async (_: unknown, __: unknown, ctx: Context) => {
                clearAuthCookie(ctx.res);
                return true;
            },

            createDiaryEntry: async (
                _: unknown,
                args: CreateDiaryEntryArgs,
                ctx: Context,
            ) => {
                const userId = requireUser(ctx);
                const diaryEntry = await prisma.diaryEntry.create({
                    data: { text: args.text, dayKey: args.dayKey, userId },
                });
                return diaryEntry;
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

            requestGenerateGarden: async (_: unknown, args: GardenArgs, ctx: Context) => {
                const userId = requireUser(ctx);

                let pending = await prisma.garden.upsert({
                    where: {
                        userId_period_periodKey: {
                            userId,
                            period: args.period,
                            periodKey: args.periodKey,
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
                        periodKey: args.periodKey,
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
                    periodKey: args.periodKey,
                });

                return mapGardenOut(pending);
            },
        },
    };
}
