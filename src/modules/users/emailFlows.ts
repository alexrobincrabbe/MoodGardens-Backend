// apps/api/src/modules/auth/emailFlows.ts
import { prisma } from "../../lib/prismaClient.js";
import { createTokenForUser, consumeToken } from "../../mail/lib/tokens.js";
import { sendEmail } from "../../mail/lib/mail.js";

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";

export async function sendVerificationEmail(user: {
    id: string;
    email: string;
    displayName?: string | null;
}) {
    const tokenRecord = await createTokenForUser({
        userId: user.id,
        type: "verify-email",
    });

    const verifyUrl = `${APP_ORIGIN}/auth/verify-email?token=${encodeURIComponent(
        tokenRecord.token
    )}`;


    const text = `
Hi ${user.displayName || "there"},

Welcome to Mood Gardens 🌱

Please verify your email address by clicking this link:

${verifyUrl}

If you didn't create this account, you can ignore this message.
`;

    const html = `
<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
  
  <h2 style="color: #2e7d32; margin-bottom: 10px;">
    Welcome to Mood Gardens 🌱
  </h2>

  <p>Hi ${user.displayName || "there"},</p>

  <p>Thanks for creating an account! Before you can sign in, please confirm your email address.</p>

  <div style="margin: 30px 0;">
    <a href="${verifyUrl}" 
       style="
         display: inline-block;
         background: #2e7d32; 
         color: white; 
         padding: 12px 20px; 
         border-radius: 6px; 
         text-decoration: none;
         font-weight: bold;
       ">
      Verify Email
    </a>
  </div>

  <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>

  <p style="word-break: break-all;">
    <a href="${verifyUrl}">${verifyUrl}</a>
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

  <p style="font-size: 12px; color: #666;">
    If you didn't create this account, you can safely ignore this email.
  </p>

</div>
`;


    await sendEmail({
        to: user.email,
        subject: "Verify your Mood Gardens account",
        text,
        html,
    });
}

export async function verifyEmailByToken(token: string) {
    const record = await consumeToken(token, "verify-email");
    if (!record) return null;

    const user = await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
    });

    return user;
}

export async function sendPasswordResetEmail(user: {
    id: string;
    email: string;
    displayName?: string | null;
}) {
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

        Stay grounded 🌱
        Mood Gardens
        `;

    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        
        <h2 style="color: #2e7d32; margin-bottom: 10px;">
            Reset your Mood Gardens password 🌱
        </h2>

        <p>Hi ${user.displayName || "there"},</p>

        <p>
            We received a request to reset the password for your Mood Gardens account.
        </p>

        <p>
            Click the button below to choose a new password.  
            This link is valid for <strong>24 hours</strong>.
        </p>

        <div style="margin: 30px 0;">
            <a href="${resetUrl}"
            style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #2e7d32;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
            "
            >
            Reset Password
            </a>
        </div>

        <p>
            If the button doesn’t work, copy and paste this link into your browser:
        </p>

        <p style="word-break: break-all;">
            <a href="${resetUrl}">${resetUrl}</a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 12px; color: #666;">
            If you didn’t request a password reset, you can safely ignore this email.
            Your account will remain secure.
        </p>

        <p style="font-size: 12px; color: #666;">Stay grounded 🌱</p>
        </div>
        `;
    await sendEmail({
        to: user.email,
        subject: "Reset your Mood Gardens password",
        text,
        html
    });
}
