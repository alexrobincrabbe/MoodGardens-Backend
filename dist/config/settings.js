// apps/api/src/config/settings.ts
import "dotenv/config";
/** Trim trailing slashes from origins/URLs */
const normalizeOrigin = (s) => (s ?? "").replace(/\/+$/, "");
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";
// Where the public /share/:id page lives (your frontend)
export const PUBLIC_ORIGIN = normalizeOrigin(process.env.PUBLIC_ORIGIN || "http://localhost:4000");
// Where the SPA itself runs (used for view links)
export const APP_ORIGIN = normalizeOrigin(process.env.APP_ORIGIN || "http://localhost:5173");
// CORS allowlist
const rawCors = process.env.CORS_ORIGINS || APP_ORIGIN;
export const CORS_ORIGINS = rawCors
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);
export const allowedOrigins = new Set([APP_ORIGIN, ...CORS_ORIGINS]);
// Cookies
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true"; // true in prod (HTTPS)
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
// Port
export const PORT = Number(process.env.PORT ?? 4000);
// CORS options (exported so index.ts can just use it)
export const corsOptions = {
    origin(origin, cb) {
        if (!origin)
            return cb(null, true); // non-browser / same-origin
        try {
            const host = new URL(origin).hostname;
            if (allowedOrigins.has(origin) || /\.vercel\.app$/.test(host)) {
                return cb(null, true);
            }
        }
        catch {
            /* ignore */
        }
        return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight"],
};
/** Helper to safely join origin + path (always a single slash) */
export const joinOrigin = (origin, path) => new URL(path.replace(/^\/+/, ""), origin.replace(/\/+$/, "") + "/").toString();
