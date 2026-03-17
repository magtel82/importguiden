/**
 * SMTP-wrapper via one.com – skickar alertmail till info@importguiden.se
 *
 * Miljövariabler som krävs:
 *   SMTP_USER      – e-postadress (ex. info@importguiden.se)
 *   SMTP_PASSWORD  – lösenord för one.com-kontot
 *
 * one.com SMTP-inställningar (hårdkodade):
 *   Host: send.one.com
 *   Port: 587
 *   Säkerhet: STARTTLS
 */

import nodemailer from "nodemailer";

export async function sendAlert(subject: string, body: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!user || !password) {
    console.error("[mailer] SMTP_USER eller SMTP_PASSWORD saknas – mail skickas ej");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "send.one.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from: `Importguiden <${user}>`,
    to: "info@importguiden.se",
    subject,
    text: body,
  });

  console.log(`[mailer] Mail skickat: ${subject}`);
}
