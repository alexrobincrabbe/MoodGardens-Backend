import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request } from "express";
import { getRateLimitKey } from "./rateLimit.js";

// Mock redis module
vi.mock("./redis.js", () => ({
    redis: {
        incr: vi.fn(),
        expire: vi.fn(),
        ttl: vi.fn(),
    },
}));

import { redis } from "./redis.js";
import { checkRateLimit, checkMultipleRateLimits } from "./rateLimit.js";

describe("rateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getRateLimitKey", () => {
        it("should use user ID when provided", () => {
            const req = {
                ip: "127.0.0.1",
                socket: { remoteAddress: "127.0.0.1" },
            } as unknown as Request;

            const key = getRateLimitKey(req, "user123", "test");
            expect(key).toBe("test:user:user123");
        });

        it("should use IP when user ID is null", () => {
            const req = {
                ip: "127.0.0.1",
                socket: { remoteAddress: "127.0.0.1" },
            } as unknown as Request;

            const key = getRateLimitKey(req, null, "test");
            expect(key).toBe("test:ip:127.0.0.1");
        });

        it("should fallback to socket.remoteAddress when ip is missing", () => {
            const req = {
                socket: { remoteAddress: "192.168.1.1" },
            } as unknown as Request;

            const key = getRateLimitKey(req, null, "test");
            expect(key).toBe("test:ip:192.168.1.1");
        });

        it("should use 'unknown' when no IP is available", () => {
            const req = {
                socket: {},
            } as unknown as Request;

            const key = getRateLimitKey(req, null, "test");
            expect(key).toBe("test:ip:unknown");
        });
    });

    describe("checkRateLimit", () => {
        it("should allow request when under limit", async () => {
            vi.mocked(redis.incr).mockResolvedValue(5);
            vi.mocked(redis.expire).mockResolvedValue(1);
            vi.mocked(redis.ttl).mockResolvedValue(900); // 15 minutes

            const result = await checkRateLimit("test:user:123", 10, 900);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(5);
            expect(result.limit).toBe(10);
            expect(result.resetAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
            expect(redis.incr).toHaveBeenCalledWith("ratelimit:test:user:123");
            // expire is only called when count === 1, so with count 5 it won't be called
        });

        it("should set expiration on first request", async () => {
            vi.mocked(redis.incr).mockResolvedValue(1);
            vi.mocked(redis.expire).mockResolvedValue(1);
            vi.mocked(redis.ttl).mockResolvedValue(900);

            await checkRateLimit("test:user:123", 10, 900);

            expect(redis.expire).toHaveBeenCalledWith("ratelimit:test:user:123", 900);
        });

        it("should not set expiration on subsequent requests", async () => {
            vi.mocked(redis.incr).mockResolvedValue(2);
            vi.mocked(redis.ttl).mockResolvedValue(899);

            await checkRateLimit("test:user:123", 10, 900);

            expect(redis.expire).not.toHaveBeenCalled();
        });

        it("should block request when over limit", async () => {
            vi.mocked(redis.incr).mockResolvedValue(11);
            vi.mocked(redis.ttl).mockResolvedValue(800);

            const result = await checkRateLimit("test:user:123", 10, 900);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it("should handle TTL of -1 (key exists but no expiration)", async () => {
            vi.mocked(redis.incr).mockResolvedValue(5);
            vi.mocked(redis.expire).mockResolvedValue(1);
            vi.mocked(redis.ttl).mockResolvedValue(-1);

            const result = await checkRateLimit("test:user:123", 10, 900);

            // Should use windowSeconds as fallback
            expect(result.resetAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
        });
    });

    describe("checkMultipleRateLimits", () => {
        it("should return blocked result when any limit is exceeded", async () => {
            vi.mocked(redis.incr)
                .mockResolvedValueOnce(6) // First limit: 5 per 15 min - EXCEEDED
                .mockResolvedValueOnce(20); // Second limit: 25 per 24h - OK
            vi.mocked(redis.expire).mockResolvedValue(1);
            vi.mocked(redis.ttl)
                .mockResolvedValueOnce(800)
                .mockResolvedValueOnce(86400);

            const result = await checkMultipleRateLimits("test:user:123", [
                { limit: 5, windowSeconds: 900 },
                { limit: 25, windowSeconds: 86400 },
            ]);

            expect(result.allowed).toBe(false);
            expect(result.limit).toBe(5);
        });

        it("should return most restrictive when all limits are OK", async () => {
            vi.mocked(redis.incr)
                .mockResolvedValueOnce(3) // First limit: 5 per 15 min - 2 remaining
                .mockResolvedValueOnce(20); // Second limit: 25 per 24h - 5 remaining
            vi.mocked(redis.expire).mockResolvedValue(1);
            vi.mocked(redis.ttl)
                .mockResolvedValueOnce(800)
                .mockResolvedValueOnce(86400);

            const result = await checkMultipleRateLimits("test:user:123", [
                { limit: 5, windowSeconds: 900 },
                { limit: 25, windowSeconds: 86400 },
            ]);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(2); // Most restrictive (least remaining)
            expect(result.limit).toBe(5);
        });
    });
});

