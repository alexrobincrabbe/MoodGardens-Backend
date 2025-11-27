// src/routes/auth.ts
import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prismaClient.js";
import { createTokenForUser, consumeToken } from "../mail/lib/tokens.js";
import { sendEmail } from "../mail/lib/mail.js";

export const authRouter = express.Router();

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

authRouter.post("/register", async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName,
                emailVerified: false,
                // timezone, dayRolloverHour, etc…
            },
        });

        const tokenRecord = await createTokenForUser({
            userId: user.id,
            type: "verify-email",
        });

        const verifyUrl = `${APP_ORIGIN}/auth/verify-email?token=${encodeURIComponent(
            tokenRecord.token
        )}`;

        const text = `
            Hi ${displayName || "there"},

            Welcome to Mood Gardens 🌱

            Please verify your email address by clicking this link:

            ${verifyUrl}

            If you didn't create this account, you can ignore this message.
            `;

        await sendEmail({
            to: user.email,
            subject: "Verify your Mood Gardens account",
            text,
        });

        return res.status(201).json({ ok: true, message: "User created; verification email sent" });
    } catch (err) {
        console.error("[register] error", err);
        return res.status(500).json({ error: "Server error" });
    }
});


authRouter.get("/verify-email", async (req, res) => {
    try {
        const token = String(req.query.token || "");
        if (!token) return res.status(400).json({ error: "Missing token" });

        const record = await consumeToken(token, "verify-email");
        if (!record) return res.status(400).json({ error: "Invalid or expired token" });

        await prisma.user.update({
            where: { id: record.userId },
            data: { emailVerified: true },
        });

        // You can either redirect to frontend or just send JSON
        // Redirect example:
        // return res.redirect(`${APP_ORIGIN}/auth/verify-email/success`);
        return res.json({ ok: true, message: "Email verified" });
    } catch (err) {
        console.error("[verify-email] error", err);
        return res.status(500).json({ error: "Server error" });
    }
});

authRouter.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const user = await prisma.user.findUnique({ where: { email } });

        // Do NOT reveal whether user exists
        if (!user) {
            return res.json({ ok: true, message: "If that email exists, a reset link was sent" });
        }

        const tokenRecord = await createTokenForUser({
            userId: user.id,
            type: "reset-password",
        });

        const resetUrl = `${APP_ORIGIN}/auth/reset-password?token=${encodeURIComponent(
            tokenRecord.token
        )}`;

        const text = `
            Hi ${user.displayName || "there"},

            We received a request to reset your Mood Gardens password.

            You can reset it using this link (valid for 24 hours):

            ${resetUrl}

            If you didn't request this, you can safely ignore this email.
            `;

        await sendEmail({
            to: user.email,
            subject: "Reset your Mood Gardens password",
            text,
        });

        return res.json({ ok: true, message: "If that email exists, a reset link was sent" });
    } catch (err) {
        console.error("[forgot-password] error", err);
        return res.status(500).json({ error: "Server error" });
    }
});


authRouter.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: "Token and password required" });
        }

        const record = await consumeToken(token, "reset-password");
        if (!record) return res.status(400).json({ error: "Invalid or expired token" });

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: record.userId },
            data: { passwordHash },
        });

        return res.json({ ok: true, message: "Password updated" });
    } catch (err) {
        console.error("[reset-password] error", err);
        return res.status(500).json({ error: "Server error" });
    }
});
