import nodemailer from "nodemailer";

// MAIL_MODE decides where emails go:
//   sandbox (default) -> Ethereal, a free FAKE inbox. Nothing reaches real people.
//                        If Ethereal can't be reached, the email is printed in the terminal instead.
//   console           -> never sends; just prints the email in the backend terminal.
//   live              -> real delivery through your SMTP account (SMTP_HOST, SMTP_USER, ...).
export const MAIL_MODE = (process.env.MAIL_MODE || "sandbox").toLowerCase();
export const isSandbox = () => MAIL_MODE !== "live";

let sandboxTransport; // created once, the first time we need it

async function getTransport() {
  if (MAIL_MODE === "live") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  if (!sandboxTransport) {
    const account = await nodemailer.createTestAccount(); // asks Ethereal for a fake mailbox
    sandboxTransport = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
  }
  return sandboxTransport;
}

// Sends one email. Returns { previewUrl } in sandbox mode (a web page that shows the email).
// It never throws: if sending fails, the problem is printed and the caller carries on.
export async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || "Make Me Pretty <no-reply@makemepretty.test>";

  if (MAIL_MODE !== "console") {
    try {
      const info = await (await getTransport()).sendMail({ from, to, subject, text, html });
      const previewUrl = MAIL_MODE === "live" ? null : nodemailer.getTestMessageUrl(info) || null;
      if (previewUrl) console.log(`[mail] Sandbox email to ${to}. Open it here: ${previewUrl}`);
      return { previewUrl };
    } catch (error) {
      console.error(`[mail] Could not send (${error.message}).${MAIL_MODE === "live" ? "" : " Showing the email here instead:"}`);
      if (MAIL_MODE === "live") return { previewUrl: null, failed: true };
    }
  }

  console.log(`\n[mail] ---- email to ${to} ----\nSubject: ${subject}\n${text}\n[mail] ---- end ----\n`);
  return { previewUrl: null };
}
