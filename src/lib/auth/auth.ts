// apps/api/src/lib/auth.ts
import jwt from "jsonwebtoken";
import type express from "express";
import { JWT_SECRET, COOKIE_SECURE, COOKIE_DOMAIN } from "../../config/settings.js";
import { GraphQLError } from "graphql";


export function signJwt(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function setAuthCookie(res: express.Response, token: string) {
    res.cookie("mg_jwt", token, {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}

export function clearAuthCookie(res: express.Response) {
    res.clearCookie("mg_jwt", {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        path: "/",
    });
}

export type Context = { userId: string | null; req: express.Request; res: express.Response };

export function requireUser(ctx: Context): string {
    if (!ctx.userId) {
        throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }
    return ctx.userId;
}