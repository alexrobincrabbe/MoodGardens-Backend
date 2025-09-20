// apps/api/src/lib/auth.ts
import jwt from "jsonwebtoken";
import { JWT_SECRET, COOKIE_SECURE, COOKIE_DOMAIN } from "../config/settings.js";
import { GraphQLError } from "graphql";
export function signJwt(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
export function setAuthCookie(res, token) {
    res.cookie("mg_jwt", token, {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
// apps/api/src/lib/auth.ts
export function clearAuthCookie(res) {
    res.clearCookie("mg_jwt", {
        httpOnly: true,
        sameSite: COOKIE_SECURE ? "none" : "lax",
        secure: COOKIE_SECURE,
        domain: COOKIE_DOMAIN,
        path: "/",
    });
}
export function requireUser(ctx) {
    if (!ctx.userId) {
        throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }
    return ctx.userId;
}
