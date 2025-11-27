import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config(); // loads .env

async function main() {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY!,
        url: "https://api.eu.mailgun.net"
    });

    const DOMAIN = process.env.MAILGUN_DOMAIN!;
    const FROM = process.env.MAILGUN_FROM || `no-reply@${DOMAIN}`;

    console.log("Sending test email...");

    try {
        const result = await mg.messages.create(DOMAIN, {
            from: FROM,
            to: "alexandercrabbe9@gmail.com", // change this
            subject: "Mailgun Test from Mood Gardens 🌱",
            text: "If you see this, Mailgun is working!",
        });

        console.log("Email sent successfully:");
        console.log(result);
    } catch (err) {
        console.error("Mailgun error:", err);
    }
}

main();
