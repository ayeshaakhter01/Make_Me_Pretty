import jwt from "jsonwebtoken";
import User from "../../../models/User.js";

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
    addresses: user.addresses
  };
}

export async function registerUser({ name, email, password }) {
  if (!process.env.JWT_SECRET?.trim()) {
    const error = new Error("Authentication is not configured. Add JWT_SECRET to backend/.env and restart the backend.");
    error.statusCode = 503;
    throw error;
  }
  if (!name?.trim() || !email?.trim() || !password) {
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
    password
  });

  return {
    user: publicUser(user),
    token: createToken(user)
  };
}

// Create staff accounts out of band (for example with the seed script). Public
// registration must never accept a caller supplied role.

export async function loginUser({ email, password }) {
  if (!email?.trim() || !password) {
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

  return {
    user: publicUser(user),
    token: createToken(user)
  };
}
