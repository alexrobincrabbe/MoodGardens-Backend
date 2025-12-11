import { type PrismaClient, type Garden, GardenPeriod, GardenStatus, GardenType } from "@prisma/client";

export class GardenRepository {
    constructor(private prisma: PrismaClient) {}

    async findUnique(args: {
        userId: string;
        period: GardenPeriod;
        periodKey: string;
    }): Promise<Garden | null> {
        return this.prisma.garden.findUnique({
            where: {
                userId_period_periodKey: args,
            },
        });
    }

    async findMany(args: {
        userId: string;
        period?: GardenPeriod;
        periodKeyStartsWith?: string;
        orderBy?: { periodKey: "asc" | "desc" };
    }): Promise<Garden[]> {
        const where: {
            userId: string;
            period?: GardenPeriod;
            periodKey?: { startsWith: string };
        } = { userId: args.userId };
        
        if (args.period) {
            where.period = args.period;
        }
        if (args.periodKeyStartsWith) {
            where.periodKey = { startsWith: args.periodKeyStartsWith };
        }

        return this.prisma.garden.findMany({
            where,
            orderBy: args.orderBy || { periodKey: "asc" },
        });
    }

    async create(args: {
        userId: string;
        period: GardenPeriod;
        periodKey: string;
        type: GardenType;
        shareId: string;
    }): Promise<Garden> {
        return this.prisma.garden.create({
            data: {
                userId: args.userId,
                period: args.period,
                periodKey: args.periodKey,
                type: args.type,
                status: GardenStatus.PENDING,
                summary: "Your garden is growing…",
                progress: 0,
                shareId: args.shareId,
            },
        });
    }

    async update(args: {
        id: string;
        status?: GardenStatus;
        progress?: number;
    }): Promise<Garden> {
        const data: {
            status?: GardenStatus;
            progress?: number;
            updatedAt: Date;
        } = {
            updatedAt: new Date(),
        };
        
        if (args.status !== undefined) data.status = args.status;
        if (args.progress !== undefined) data.progress = args.progress;

        return this.prisma.garden.update({
            where: { id: args.id },
            data,
        });
    }

    async findById(id: string): Promise<Garden | null> {
        return this.prisma.garden.findUnique({
            where: { id },
        });
    }
}

