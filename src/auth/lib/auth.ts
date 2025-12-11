import jwt from "jsonwebtoken";
import type express from "express";
import { JWT_SECRET } from "../../config/settings.js";
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


export function getUserIdFromRequest(req: express.Request): string | null {
  // 1) Prefer Authorization: Bearer <token>  (for mobile / API clients)
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice("Bearer ".length).trim() || undefined;
  }

  // 2) Fallback to cookie (for web browser clients)
  if (!token) {
    token = (req as any).cookies?.mg_jwt as string | undefined;
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      userId?: string;
      id?: string;
    };
    return payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}


export function requireUser(ctx: Context): string {
    if (!ctx.userId) {
        throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }
    return ctx.userId;
}


/**
 * For REST routes (like /billing/create-checkout-session)
 */
export function requireUserFromRequest(req: express.Request): string {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

