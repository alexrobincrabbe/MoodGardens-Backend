import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { UserRepository } from "./userRepository.js";

// Mock Prisma client
const mockPrisma = {
    user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
    },
} as unknown as PrismaClient;

describe("UserRepository", () => {
    let repository: UserRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repository = new UserRepository(mockPrisma);
    });

    describe("findById", () => {
        it("should return user when found", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                displayName: "Test User",
                createdAt: new Date(),
                isPremium: false,
                premiumSince: null,
                regenerateTokens: 3,
                timezone: "UTC",
                dayRolloverHour: 0,
                notifyWeeklyGarden: true,
                notifyMonthlyGarden: true,
                notifyYearlyGarden: true,
            };

            vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await repository.findById("user123");

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalled();
            const callArgs = vi.mocked(mockPrisma.user.findUnique).mock.calls[0][0];
            expect(callArgs.where).toEqual({ id: "user123" });
            expect(callArgs.select).toBeDefined();
        });

        it("should return null when user not found", async () => {
            vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

            const result = await repository.findById("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("findByEmail", () => {
        it("should return user when found by email", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                displayName: "Test User",
                createdAt: new Date(),
            };

            vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await repository.findByEmail("test@example.com");

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
        });
    });

    describe("findUserSettings", () => {
        it("should return user settings", async () => {
            const mockUser = {
                timezone: "America/New_York",
                dayRolloverHour: 3,
            };

            vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any);

            const result = await repository.findUserSettings("user123");

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalled();
            const callArgs = vi.mocked(mockPrisma.user.findUnique).mock.calls[0][0];
            expect(callArgs.where).toEqual({ id: "user123" });
            expect(callArgs.select).toBeDefined();
            expect(callArgs.select?.timezone).toBe(true);
            expect(callArgs.select?.dayRolloverHour).toBe(true);
        });
    });

    describe("update", () => {
        it("should update user with provided fields", async () => {
            const mockUpdatedUser = {
                id: "user123",
                email: "newemail@example.com",
                displayName: "New Name",
                createdAt: new Date(),
                isPremium: false,
                premiumSince: null,
                regenerateTokens: 3,
                timezone: "UTC",
                dayRolloverHour: 0,
                notifyWeeklyGarden: true,
                notifyMonthlyGarden: true,
                notifyYearlyGarden: true,
            };

            vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUpdatedUser as any);

            const result = await repository.update({
                id: "user123",
                email: "newemail@example.com",
                displayName: "New Name",
            });

            expect(result).toEqual(mockUpdatedUser);
            expect(mockPrisma.user.update).toHaveBeenCalled();
            const callArgs = vi.mocked(mockPrisma.user.update).mock.calls[0][0];
            expect(callArgs.where).toEqual({ id: "user123" });
            expect(callArgs.data.email).toBe("newemail@example.com");
            expect(callArgs.data.displayName).toBe("New Name");
            expect(callArgs.select).toBeDefined();
        });

        it("should handle regenerateTokens increment", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                displayName: "Test",
                createdAt: new Date(),
                isPremium: false,
                premiumSince: null,
                regenerateTokens: 8,
                timezone: "UTC",
                dayRolloverHour: 0,
                notifyWeeklyGarden: true,
                notifyMonthlyGarden: true,
                notifyYearlyGarden: true,
            };

            vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUser as any);

            await repository.update({
                id: "user123",
                regenerateTokens: { increment: 5 },
            });

            expect(mockPrisma.user.update).toHaveBeenCalled();
            const callArgs = vi.mocked(mockPrisma.user.update).mock.calls[0][0];
            expect(callArgs.where).toEqual({ id: "user123" });
            expect(callArgs.data.regenerateTokens).toEqual({ increment: 5 });
        });

        it("should handle regenerateTokens decrement", async () => {
            const mockUser = {
                id: "user123",
                email: "test@example.com",
                displayName: "Test",
                createdAt: new Date(),
                isPremium: false,
                premiumSince: null,
                regenerateTokens: 2,
                timezone: "UTC",
                dayRolloverHour: 0,
                notifyWeeklyGarden: true,
                notifyMonthlyGarden: true,
                notifyYearlyGarden: true,
            };

            vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUser as any);

            await repository.update({
                id: "user123",
                regenerateTokens: { decrement: 1 },
            });

            expect(mockPrisma.user.update).toHaveBeenCalled();
            const callArgs = vi.mocked(mockPrisma.user.update).mock.calls[0][0];
            expect(callArgs.where).toEqual({ id: "user123" });
            expect(callArgs.data.regenerateTokens).toEqual({ decrement: 1 });
        });
    });
});

