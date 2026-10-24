import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword
} from "../services/userService.js";

export async function getProfile(req, res) {
  try {
    const user = await getMyProfile(req.user._id);

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to load profile."
    });
  }
}

export async function changePassword(req, res) {
  try {
    await changeMyPassword(req.user._id, req.body ?? {});
    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to change password."
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await updateMyProfile(req.user._id, req.body ?? {});

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to update profile."
    });
  }
}
