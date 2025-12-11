import { type PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserRepository, type UserPublic } from "../repositories/userRepository.js";
import { validateEmail } from "../../lib/validation/emailValidation.js";
import { validateNewPassword } from "../../lib/validation/passwordValidation.js";
import { throwBadInput, throwUnauthenticated } from "../../lib/errors/GraphQLErrors.js";
import { logger } from "../../lib/logger.js";

export class UserService {
    private userRepository: UserRepository;

    constructor(private prisma: PrismaClient) {
        this.userRepository = new UserRepository(prisma);
    }

    async updateSettings(args: {
        userId: string;
        timezone: string;
        dayRolloverHour: number;
    }): Promise<UserPublic> {
        const safeHour = Math.min(23, Math.max(0, Math.floor(args.dayRolloverHour)));
        return this.userRepository.update({
            id: args.userId,
            timezone: args.timezone,
            dayRolloverHour: safeHour,
        });
    }

    async updateProfile(args: {
        userId: string;
        email: string;
        displayName: string;
    }): Promise<UserPublic> {
        const email = validateEmail(args.email);
        const displayName = args.displayName.trim();

        if (!displayName) {
            throwBadInput("Display name cannot be empty");
        }

        try {
            return await this.userRepository.update({
                id: args.userId,
                email,
                displayName,
            });
        } catch (err: unknown) {
            logger.error("Prisma error updating user profile", err, { userId: args.userId });
            if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
                const target = (err as { meta?: { target?: string | string[] } }).meta?.target;
                const isEmailTarget =
                    typeof target === "string"
                        ? target.includes("email")
                        : Array.isArray(target) && target.includes("email");
                if (isEmailTarget) {
                    throwBadInput("That email address is already in use");
                }
            }
            throw err;
        }
    }

    async changePassword(args: {
        userId: string;
        currentPassword: string;
        newPassword: string;
    }): Promise<boolean> {
        const user = await this.userRepository.findPasswordHash(args.userId);

        if (!user || !user.passwordHash) {
            throwUnauthenticated("User not found");
        }

        // Check current password
        const ok = await bcrypt.compare(args.currentPassword, user.passwordHash);
        if (!ok) {
            throwBadInput("Your current password is incorrect");
        }

        // Validate new password
        validateNewPassword(args.newPassword);

        // Hash and save new password
        const newHash = await bcrypt.hash(args.newPassword, 12);
        await this.userRepository.update({
            id: args.userId,
            passwordHash: newHash,
        });

        return true;
    }

    async markPremium(userId: string): Promise<UserPublic> {
        return this.userRepository.update({
            id: userId,
            isPremium: true,
            premiumSince: new Date(),
        });
    }

    async addRegenTokens(args: {
        userId: string;
        amount: number;
    }): Promise<UserPublic> {
        const amount = Math.max(0, Math.min(args.amount ?? 0, 100)); // simple safety
        return this.userRepository.update({
            id: args.userId,
            regenerateTokens: { increment: amount },
        });
    }
}

