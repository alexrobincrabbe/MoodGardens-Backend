import "dotenv/config";
import type cors from "cors";

//CORS
const normalizeOrigin = (s?: string) => (s ?? "").replace(/\/+$/, "");
export const APP_ORIGIN = normalizeOrigin(process.env.APP_ORIGIN || "http://localhost:5173");
const rawCors = process.env.CORS_ORIGINS || APP_ORIGIN;
export const CORS_ORIGINS = rawCors
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);
export const allowedOrigins = new Set<string>([APP_ORIGIN, ...CORS_ORIGINS]);
export const corsOptions: cors.CorsOptions = {
    origin(origin, cb) {
        if (!origin) return cb(null, true);
        try {
            const host = new URL(origin).hostname;
            if (allowedOrigins.has(origin) || /\.vercel\.app$/.test(host)) {
                return cb(null, true);
            }
        } catch {
            /* ignore */
        }
        return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight"],
};
export const joinOrigin = (origin: string, path: string) =>
    new URL(path.replace(/^\/+/, ""), origin.replace(/\/+$/, "") + "/").toString();

//AUTH
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true"; 
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

//PORT
export const PORT = Number(process.env.PORT ?? 4000);


