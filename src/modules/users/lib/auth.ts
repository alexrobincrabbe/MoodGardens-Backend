import jwt from "jsonwebtoken";
import type express from "express";
import { JWT_SECRET } from "../../../config/settings.js";
import { GraphQLError } from "graphql";
import type { Response } from "express";


export function signJwt(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

const isProd = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,                  
  sameSite: isProd ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
} as const;

export function setAuthCookie(res: Response, token: string) {
  res.cookie("mg_jwt", token, authCookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("mg_jwt", {
    ...authCookieOptions,
    maxAge: 0,
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