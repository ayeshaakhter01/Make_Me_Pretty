import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in to access this resource."
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Server authentication is not configured."
    });
  }

  const token = authorization.slice("Bearer ".length);
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your login token is invalid or expired."
    });
  }

  try {
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This account no longer exists."
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}