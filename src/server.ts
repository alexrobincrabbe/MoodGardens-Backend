// apps/api/src/server.ts (or wherever you build the Express app)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { JWT_SECRET, COOKIE_SECURE } from "./config/settings.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000","https://mood-gardens-frontend.vercel.app/"], // adjust
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// If you're behind a proxy (Vercel/Render/Heroku/Nginx), allow secure cookies:
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Attach userId from mg_jwt cookie if valid
app.use((req, _res, next) => {
  const token = req.cookies?.mg_jwt;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      (req as any).userId = payload.sub as string;
    } catch {
      (req as any).userId = null;
    }
  } else {
    (req as any).userId = null;
  }
  next();
});
