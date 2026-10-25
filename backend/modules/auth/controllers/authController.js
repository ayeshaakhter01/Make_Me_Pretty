import { loginUser, registerUser, resendVerification, verifyEmail } from "../services/authService.js";

// One small helper so every endpoint answers errors the same way.
function sendError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : fallbackMessage,
    ...(error.code ? { code: error.code } : {})
  });
}

export async function register(req, res) {
  try {
    const result = await registerUser(req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email and click the verification link.",
      data: result
    });
  } catch (error) {
    return sendError(res, error, "Unable to create account.");
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body ?? {});

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result
    });
  } catch (error) {
    return sendError(res, error, "Unable to log in.");
  }
}

export async function verifyEmailLink(req, res) {
  try {
    const result = await verifyEmail(req.body ?? {});
    return res.status(200).json({ success: true, message: "Your email is verified. You can sign in now.", data: result });
  } catch (error) {
    return sendError(res, error, "Unable to verify email.");
  }
}

export async function resendVerificationEmail(req, res) {
  try {
    const result = await resendVerification(req.body ?? {});
    return res.status(200).json({ success: true, message: result.message, data: result });
  } catch (error) {
    return sendError(res, error, "Unable to send the email.");
  }
}

export function getMe(req, res) {
  const user = req.user;

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    }
  });
}
