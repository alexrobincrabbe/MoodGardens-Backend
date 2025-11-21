// apps/api/src/server.ts (or wherever you build the Express app)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config/settings.js";
import { setupAdminPanel } from "./admin/admin.js"; // adjust path
const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://mood-gardens-frontend.vercel.app/"], // adjust
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "production")
    app.set("trust proxy", 1);
app.use((req, _res, next) => {
    const token = req.cookies?.mg_jwt;
    if (token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.userId = payload.sub;
        }
        catch {
            req.userId = null;
        }
    }
    else {
        req.userId = null;
    }
    next();
});
setupAdminPanel(app);
