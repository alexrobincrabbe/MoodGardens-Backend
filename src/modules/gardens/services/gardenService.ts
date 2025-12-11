import { type PrismaClient, GardenPeriod, GardenType, GardenStatus } from "@prisma/client";
import { GardenRepository } from "../repositories/gardenRepository.js";
import { GardenDecryptionService } from "./gardenDecryptionService.js";
import { mapGardenOut, generateShareId } from "../lib/gardens.js";
import { gardenQueue } from "../../../queues/garden.queue.js";
import { computeDiaryDayKey } from "../../diary/utils/diaryDayKey.js";
import { throwBadInput, throwInternalError } from "../../../lib/errors/GraphQLErrors.js";
import type { Garden } from "@prisma/client";

export class GardenService {
    private repository: GardenRepository;
    private decryptionService: GardenDecryptionService;

    constructor(private prisma: PrismaClient) {
        this.repository = new GardenRepository(prisma);
        this.decryptionService = new GardenDecryptionService(prisma);
    }

    async getGarden(args: {
        userId: string;
        period: GardenPeriod;
        periodKey: string;
    }): Promise<ReturnType<typeof mapGardenOut> | null> {
        const garden = await this.repository.findUnique(args);
        const decrypted = await this.decryptionService.decryptGardenSummaryIfNeeded(
            args.userId,
            garden
        );
        return mapGardenOut(decrypted);
    }

    async getGardensByPeriod(args: {
        userId: string;
        period: GardenPeriod;
    }): Promise<ReturnType<typeof mapGardenOut>[]> {
        const gardens = await this.repository.findMany({
            userId: args.userId,
            period: args.period,
            orderBy: { periodKey: "asc" },
        });

        const decrypted = await this.decryptionService.decryptGardenSummariesIfNeeded(
            args.userId,
            gardens
        );
        return decrypted.map(mapGardenOut);
    }

    async getGardensByMonth(args: {
        userId: string;
        monthKey: string;
    }): Promise<ReturnType<typeof mapGardenOut>[]> {
        const gardens = await this.repository.findMany({
            userId: args.userId,
            period: GardenPeriod.DAY,
            periodKeyStartsWith: `${args.monthKey}-`,
            orderBy: { periodKey: "asc" },
        });

        const decrypted = await this.decryptionService.decryptGardenSummariesIfNeeded(
            args.userId,
            gardens
        );
        return decrypted.map(mapGardenOut);
    }

    async requestGenerateGarden(args: {
        userId: string;
        period: GardenPeriod;
        periodKey: string | null;
        gardenType: GardenType;
        userTimezone: string | null;
        userDayRolloverHour: number | null;
    }): Promise<ReturnType<typeof mapGardenOut>> {
        let periodKey: string;
        if (args.period === GardenPeriod.DAY) {
            periodKey = computeDiaryDayKey(
                args.userTimezone ?? "UTC",
                args.userDayRolloverHour ?? 0,
            );
            } else {
                if (!args.periodKey) {
                    throwBadInput("periodKey is required for non-DAY gardens");
                }
                periodKey = args.periodKey;
            }

        const pending = await this.repository.create({
            userId: args.userId,
            period: args.period,
            periodKey,
            type: args.gardenType,
            shareId: generateShareId(),
        });

        await gardenQueue.add("generate", {
            gardenId: pending.id,
            period: args.period,
            periodKey,
        });

        return mapGardenOut(pending);
    }

    async regenerateGarden(args: {
        userId: string;
        gardenId: string;
    }): Promise<ReturnType<typeof mapGardenOut>> {
        // Atomically decrement tokens
        const updateResult = await this.prisma.user.updateMany({
            where: { id: args.userId, regenerateTokens: { gt: 0 } },
            data: { regenerateTokens: { decrement: 1 } },
        });

        if (updateResult.count === 0) {
            throwBadInput("You have no regenerate tokens left.");
        }

        // Flip garden to PENDING and reset progress
        const garden = await this.repository.update({
            id: args.gardenId,
            status: GardenStatus.PENDING,
            progress: 0,
        });

        // Enqueue job after status is pending
        await gardenQueue.add("generate", {
            gardenId: garden.id,
            period: garden.period,
            periodKey: garden.periodKey,
        });

        return mapGardenOut(garden);
    }
}

