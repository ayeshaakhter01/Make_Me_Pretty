import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import User from "../../../models/User.js";
import { sendMail, isSandbox } from "../../../utils/mailer.js";

const VERIFY_HOURS = 24;
// Email verification is ON unless REQUIRE_EMAIL_VERIFICATION=false is set in backend/.env.
// Turning it off is only for automated API runs (for example other collections that sign up and
// immediately use the returned token). Never turn it off in a real deployment.
const verificationRequired = () => String(process.env.REQUIRE_EMAIL_VERIFICATION).toLowerCase() !== "false";
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const clientUrl = () => (process.env.CLIENT_URL || (process.env.CLIENT_ORIGINS || "http://localhost:5173").split(",")[0]).trim().replace(/\/$/, "");

function fail(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

// Makes a one-time link, saves only its scrambled (hashed) copy, and emails the link.
async function sendVerificationEmail(user) {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + VERIFY_HOURS * 60 * 60 * 1000);
  await user.save();

  const link = `${clientUrl()}/verify-email?token=${token}`;
  const text = `Hi ${user.name},\n\nPlease confirm your email address to finish creating your Make Me Pretty account:\n\n${link}\n\nThis link works for ${VERIFY_HOURS} hours. If you did not sign up, you can ignore this email.`;
  const html = `<p>Hi ${user.name.replace(/[<>&]/g, "")},</p><p>Please confirm your email address to finish creating your Make Me Pretty account.</p><p><a href="${link}" style="display:inline-block;padding:12px 22px;background:#b86b77;color:#fff;border-radius:999px;text-decoration:none">Verify my email</a></p><p style="color:#777;font-size:13px">This link works for ${VERIFY_HOURS} hours. If you did not sign up, you can ignore this email.<br>Button not working? Copy this link: ${link}</p>`;
  const { previewUrl } = await sendMail({ to: user.email, subject: "Verify your email - Make Me Pretty", text, html });

  // In sandbox mode only, the site is told where to open the test email. Never sent in live mode.
  return isSandbox() ? previewUrl || link : undefined;
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from backend/.env");
  }

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    addresses: user.addresses,
    emailVerified: user.emailVerified !== false
  };
}

export async function registerUser({ name, email, password }) {
  if (!process.env.JWT_SECRET?.trim()) {
    const error = new Error("Authentication is not configured. Add JWT_SECRET to backend/.env and restart the backend.");
    error.statusCode = 503;
    throw error;
  }
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
    const error = new Error("Name, email, and password are required.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters.");
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    emailVerified: !verificationRequired()
  });

  if (!verificationRequired()) {
    return { user: publicUser(user), token: createToken(user) };
  }

  const sandboxLink = await sendVerificationEmail(user);

  // No login token yet - the customer must verify first.
  return { requiresVerification: true, email: user.email, ...(sandboxLink ? { sandboxLink } : {}) };
}

export async function verifyEmail({ token }) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    throw fail("This verification link is not valid.", 400, "INVALID_LINK");
  }

  const user = await User.findOne({ emailVerificationTokenHash: hashToken(token) }).select("+emailVerificationTokenHash +emailVerificationExpires");
  if (!user) throw fail("This link is invalid or was already used. If you already verified, just sign in.", 400, "INVALID_LINK");
  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    throw fail("This link has expired. Please request a new one.", 410, "LINK_EXPIRED");
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return { verified: true, email: user.email };
}

// Same answer whether or not the email exists, so strangers cannot probe which emails are registered.
const lastResend = new Map();
export async function resendVerification({ email }) {
  const generic = { sent: true, message: "If this email has an unverified account, a new link is on its way." };
  if (typeof email !== "string" || !email.trim()) throw fail("Please enter your email.", 400);

  const cleanEmail = email.trim().toLowerCase();
  const lastTime = lastResend.get(cleanEmail) || 0;
  if (Date.now() - lastTime < 60 * 1000) throw fail("Please wait a minute before asking for another email.", 429);
  lastResend.set(cleanEmail, Date.now());

  const user = await User.findOne({ email: cleanEmail });
  if (!user || user.emailVerified !== false) return generic;

  const sandboxLink = await sendVerificationEmail(user);
  return { ...generic, ...(sandboxLink ? { sandboxLink } : {}) };
}

// Create staff accounts out of band (for example with the seed script). Public
// registration must never accept a caller supplied role.

export async function loginUser({ email, password }) {
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Email or password is incorrect.");
    error.statusCode = 401;
    throw error;
  }

  // Customers must verify their email first. Staff accounts are not affected.
  if (user.role === "customer" && user.emailVerified === false) {
    throw fail("Please verify your email first. Check your inbox for the link we sent.", 403, "EMAIL_NOT_VERIFIED");
  }

  return {
    user: publicUser(user),
    token: createToken(user)
  };
}
