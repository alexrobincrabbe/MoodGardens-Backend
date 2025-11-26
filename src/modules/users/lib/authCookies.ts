import type { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,                  // HTTPS required when true
  sameSite: isProd ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
