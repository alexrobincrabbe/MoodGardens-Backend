// apps/api/src/lib/mail.ts
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
  url: process.env.MAILGUN_API_BASE || "https://api.eu.mailgun.net", // you found this works
});

const DOMAIN = process.env.MAILGUN_DOMAIN!;
const FROM =
  process.env.MAILGUN_FROM || `"Mood Gardens" <no-reply@${DOMAIN}>`;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const { to, subject, text, html } = opts;

  return mg.messages.create(DOMAIN, {
    from: FROM,
    to,
    subject,
    text,
    html: html ?? text,
  });
}
