import { type PrismaClient } from "@prisma/client";
import { DiaryRepository } from "../repositories/diaryRepository.js";
import { DiaryDecryptionService } from "./diaryDecryptionService.js";
import { UserRepository } from "../../../auth/repositories/userRepository.js";
import { computeDiaryDayKey } from "../utils/diaryDayKey.js";
import { encryptDiaryForUser } from "../../../crypto/diaryEncryption.js";
import { throwInternalError } from "../../../lib/errors/GraphQLErrors.js";

export class DiaryService {
    private repository: DiaryRepository;
    private decryptionService: DiaryDecryptionService;
    private userRepository: UserRepository;

    constructor(private prisma: PrismaClient) {
        this.repository = new DiaryRepository(prisma);
        this.decryptionService = new DiaryDecryptionService(prisma);
        this.userRepository = new UserRepository(prisma);
    }

    async getDiaryEntry(args: {
        userId: string;
        dayKey: string;
    }): Promise<{
        id: string;
        text: string;
        dayKey: string;
        createdAt: Date;
    } | null> {
        const entry = await this.repository.findUnique(args);
        if (!entry) return null;

        const decryptedText = await this.decryptionService.decryptDiaryEntryIfNeeded(
            args.userId,
            entry
        );

        return {
            ...entry,
            text: decryptedText,
        };
    }

    async getPaginatedEntries(args: {
        userId: string;
        limit: number;
        offset: number;
    }): Promise<Array<{
        id: string;
        text: string;
        dayKey: string;
        createdAt: Date;
    }>> {
        const entries = await this.repository.findMany(args);
        return this.decryptionService.decryptDiaryEntriesIfNeeded(args.userId, entries);
    }

    async getCurrentDayKey(userId: string): Promise<string> {
        const user = await this.userRepository.findUserSettings(userId);
        if (!user) {
            throwInternalError("Unable to determine current day. Your user settings could not be found.");
        }
        return computeDiaryDayKey(
            user.timezone ?? "UTC",
            user.dayRolloverHour ?? 0
        );
    }

    async createDiaryEntry(args: {
        userId: string;
        text: string;
    }): Promise<{
        id: string;
        dayKey: string;
        createdAt: Date;
        text: string;
    }> {
        const user = await this.userRepository.findUserSettings(args.userId);
        if (!user) {
            throwInternalError("Unable to create diary entry. Your account settings could not be found.");
        }

        const dayKey = computeDiaryDayKey(
            user.timezone ?? "UTC",
            user.dayRolloverHour ?? 0
        );

        // Encrypt the text with the user's DEK
        const encrypted = await encryptDiaryForUser(this.prisma, args.userId, args.text);

        const diaryEntry = await this.repository.create({
            userId: args.userId,
            dayKey,
            text: "",
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            ciphertext: encrypted.ciphertext,
            keyVersion: encrypted.keyVersion,
        });

        return {
            ...diaryEntry,
            text: args.text,
        };
    }
}

