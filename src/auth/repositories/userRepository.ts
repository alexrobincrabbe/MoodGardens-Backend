import { type PrismaClient, type User } from "@prisma/client";

export const UserPublicFields = {
    id: true,
    email: true,
    isPremium: true,
    premiumSince: true,
    regenerateTokens: true,
    displayName: true,
    createdAt: true,
    timezone: true,
    dayRolloverHour: true,
    notifyWeeklyGarden: true,
    notifyMonthlyGarden: true,
    notifyYearlyGarden: true,
} as const;

export type UserPublic = Pick<User, keyof typeof UserPublicFields>;

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(id: string): Promise<UserPublic | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select: UserPublicFields,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByEmailWithPassword(email: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        displayName: string;
        passwordHash: string | null;
        emailVerified: boolean;
    } | null> {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                createdAt: true,
                displayName: true,
                passwordHash: true,
                emailVerified: true,
            },
        });
    }

    async findByGoogleId(googleId: string): Promise<UserPublic | null> {
        return this.prisma.user.findUnique({
            where: { googleId },
            select: UserPublicFields,
        });
    }

    async create(args: {
        email: string;
        passwordHash?: string;
        displayName: string;
        googleId?: string;
        emailVerified?: boolean;
    }): Promise<UserPublic> {
        return this.prisma.user.create({
            data: {
                email: args.email,
                passwordHash: args.passwordHash,
                displayName: args.displayName,
                googleId: args.googleId,
                emailVerified: args.emailVerified ?? false,
            },
            select: UserPublicFields,
        });
    }

    async update(args: {
        id: string;
        email?: string;
        displayName?: string;
        timezone?: string;
        dayRolloverHour?: number;
        passwordHash?: string;
        googleId?: string;
        emailVerified?: boolean;
        isPremium?: boolean;
        premiumSince?: Date;
        regenerateTokens?: { increment?: number; decrement?: number };
    }): Promise<UserPublic> {
        const data: {
            email?: string;
            displayName?: string;
            timezone?: string;
            dayRolloverHour?: number;
            passwordHash?: string;
            googleId?: string;
            emailVerified?: boolean;
            isPremium?: boolean;
            premiumSince?: Date;
            regenerateTokens?: { increment: number } | { decrement: number };
        } = {};
        
        if (args.email !== undefined) data.email = args.email;
        if (args.displayName !== undefined) data.displayName = args.displayName;
        if (args.timezone !== undefined) data.timezone = args.timezone;
        if (args.dayRolloverHour !== undefined) data.dayRolloverHour = args.dayRolloverHour;
        if (args.passwordHash !== undefined) data.passwordHash = args.passwordHash;
        if (args.googleId !== undefined) data.googleId = args.googleId;
        if (args.emailVerified !== undefined) data.emailVerified = args.emailVerified;
        if (args.isPremium !== undefined) data.isPremium = args.isPremium;
        if (args.premiumSince !== undefined) data.premiumSince = args.premiumSince;
        if (args.regenerateTokens) {
            if (args.regenerateTokens.increment) {
                data.regenerateTokens = { increment: args.regenerateTokens.increment };
            } else if (args.regenerateTokens.decrement) {
                data.regenerateTokens = { decrement: args.regenerateTokens.decrement };
            }
        }

        return this.prisma.user.update({
            where: { id: args.id },
            data,
            select: UserPublicFields,
        });
    }

    async updateMany(args: {
        id: string;
        regenerateTokens: { decrement: number };
    }): Promise<number> {
        const result = await this.prisma.user.updateMany({
            where: { id: args.id, regenerateTokens: { gt: 0 } },
            data: { regenerateTokens: args.regenerateTokens.decrement },
        });
        return result.count;
    }

    async findUserSettings(id: string): Promise<{
        timezone: string | null;
        dayRolloverHour: number | null;
    } | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select: { timezone: true, dayRolloverHour: true },
        });
    }

    async findPasswordHash(id: string): Promise<{ passwordHash: string | null } | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select: { passwordHash: true },
        });
    }
}


