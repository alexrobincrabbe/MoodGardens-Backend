import { redis } from "./redis.js";
import type { Request, Response, NextFunction } from "express";

/**
 * Rate limit check result
 */
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number; // Unix timestamp in seconds
    limit: number;
}

/**
 * Get the identifier for rate limiting (user ID if authenticated, otherwise IP)
 */
export function getRateLimitKey(req: Request, userId: string | null, prefix: string): string {
    if (userId) {
        return `${prefix}:user:${userId}`;
    }
    // Fallback to IP
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${prefix}:ip:${ip}`;
}

/**
 * Check and increment a rate limit counter in Redis
 * Uses INCR + EXPIRE pattern for atomic operations
 * 
 * @param key - Redis key (e.g., "ratelimit:graphql:user:123")
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit result
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    
    // Increment the counter
    const count = await redis.incr(redisKey);
    
    // Set expiration on first request (only if count === 1)
    if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
    }
    
    // Get TTL to calculate reset time
    const ttl = await redis.ttl(redisKey);
    const resetAt = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);
    
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    
    return {
        allowed,
        remaining,
        resetAt,
        limit,
    };
}

/**
 * Check multiple rate limits (e.g., short window + long window)
 * Returns the most restrictive result
 */
export async function checkMultipleRateLimits(
    key: string,
    limits: Array<{ limit: number; windowSeconds: number }>
): Promise<RateLimitResult> {
    const results = await Promise.all(
        limits.map(({ limit, windowSeconds }) =>
            checkRateLimit(key, limit, windowSeconds)
        )
    );
    
    // Find the most restrictive (first one that's not allowed, or the one with least remaining)
    const blocked = results.find((r) => !r.allowed);
    if (blocked) {
        return blocked;
    }
    
    // Return the one with the least remaining requests
    const mostRestrictive = results.reduce((min, current) =>
        current.remaining < min.remaining ? current : min
    );
    
    return mostRestrictive;
}

/**
 * Express middleware factory for rate limiting
 */
export function createRateLimitMiddleware(options: {
    prefix: string;
    limit: number;
    windowSeconds: number;
    getUserId?: (req: Request) => string | null;
    onLimitReached?: (req: Request, result: RateLimitResult) => void;
}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = options.getUserId?.(req) || null;
        const key = getRateLimitKey(req, userId, options.prefix);
        
        const result = await checkRateLimit(key, options.limit, options.windowSeconds);
        
        // Set rate limit headers
        res.setHeader("X-RateLimit-Limit", result.limit.toString());
        res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
        res.setHeader("X-RateLimit-Reset", result.resetAt.toString());
        
        if (!result.allowed) {
            if (options.onLimitReached) {
                options.onLimitReached(req, result);
            }
            return res.status(429).json({
                error: "Too many requests",
                message: `Rate limit exceeded. Try again after ${new Date(result.resetAt * 1000).toISOString()}`,
                retryAfter: result.resetAt,
            });
        }
        
        next();
    };
}

/**
 * Resolver-level rate limit check (throws GraphQL error if exceeded)
 */
export async function checkResolverRateLimit(
    userId: string | null,
    req: Request,
    prefix: string,
    limit: number,
    windowSeconds: number
): Promise<void> {
    const key = getRateLimitKey(req, userId, prefix);
    const result = await checkRateLimit(key, limit, windowSeconds);
    
    if (!result.allowed) {
        const { throwBadInput } = await import("./errors/GraphQLErrors.js");
        throwBadInput(
            `Rate limit exceeded. Maximum ${limit} requests per ${windowSeconds}s. Try again after ${new Date(result.resetAt * 1000).toISOString()}`,
            {
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: result.resetAt,
                limit: result.limit,
            }
        );
    }
}

/**
 * Resolver-level rate limit check with multiple windows
 */
export async function checkResolverMultipleRateLimits(
    userId: string | null,
    req: Request,
    prefix: string,
    limits: Array<{ limit: number; windowSeconds: number }>
): Promise<void> {
    const key = getRateLimitKey(req, userId, prefix);
    const result = await checkMultipleRateLimits(key, limits);
    
    if (!result.allowed) {
        const { throwBadInput } = await import("./errors/GraphQLErrors.js");
        throwBadInput(
            `Rate limit exceeded. Try again after ${new Date(result.resetAt * 1000).toISOString()}`,
            {
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: result.resetAt,
                limit: result.limit,
            }
        );
    }
}

