import { loginUser, registerUser } from "../services/authService.js";

export async function register(req, res) {
  try {
    const result = await registerUser(req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to create account."
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to log in."
    });
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