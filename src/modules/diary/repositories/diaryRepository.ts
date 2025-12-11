import { type PrismaClient, type DiaryEntry } from "@prisma/client";

export class DiaryRepository {
    constructor(private prisma: PrismaClient) {}

    async findUnique(args: {
        userId: string;
        dayKey: string;
    }): Promise<Pick<DiaryEntry, "id" | "text" | "dayKey" | "createdAt" | "iv" | "authTag" | "ciphertext"> | null> {
        return this.prisma.diaryEntry.findUnique({
            where: {
                userId_dayKey: args,
            },
            select: {
                id: true,
                text: true,
                dayKey: true,
                createdAt: true,
                iv: true,
                authTag: true,
                ciphertext: true,
            },
        });
    }

    async findMany(args: {
        userId: string;
        limit: number;
        offset: number;
    }): Promise<Pick<DiaryEntry, "id" | "text" | "dayKey" | "createdAt" | "iv" | "authTag" | "ciphertext">[]> {
        return this.prisma.diaryEntry.findMany({
            where: { userId: args.userId },
            orderBy: { createdAt: "desc" },
            take: Math.min(100, Math.max(1, args.limit)),
            skip: Math.max(0, args.offset),
            select: {
                id: true,
                text: true,
                dayKey: true,
                createdAt: true,
                iv: true,
                authTag: true,
                ciphertext: true,
            },
        });
    }

    async create(args: {
        userId: string;
        dayKey: string;
        text: string;
        iv: Buffer | null;
        authTag: Buffer | null;
        ciphertext: Buffer | null;
        keyVersion: number;
    }): Promise<Pick<DiaryEntry, "id" | "dayKey" | "createdAt" | "iv" | "authTag" | "ciphertext">> {
        return this.prisma.diaryEntry.create({
            data: {
                userId: args.userId,
                dayKey: args.dayKey,
                text: args.text,
                iv: args.iv,
                authTag: args.authTag,
                ciphertext: args.ciphertext,
                keyVersion: args.keyVersion,
            },
            select: {
                id: true,
                dayKey: true,
                createdAt: true,
                iv: true,
                authTag: true,
                ciphertext: true,
            },
        });
    }
}

