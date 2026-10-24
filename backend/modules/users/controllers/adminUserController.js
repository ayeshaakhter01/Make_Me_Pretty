import {
  changeUserRole,
  createStaffUser,
  listUsers,
  removeUser,
  addUserAddress,
  removeUserAddress,
  updateUserAddress,
  updateUserDetails
} from "../services/userService.js";

export async function getUsers(req, res) {
  try {
    const users = await listUsers();

    return res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to load users."
    });
  }
}

export async function addStaffUser(req, res) {
  try {
    const user = await createStaffUser(req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      data: { user }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to create staff account."
    });
  }
}

export async function updateUserRole(req, res) {
  try {
    const user = await changeUserRole(
      req.params.userId,
      req.body?.role,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: { user }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to update user role."
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const result = await removeUser(req.params.userId, req.user._id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to delete user."
    });
  }
}
export async function editUserDetails(req, res) {
  try {
    const user = await updateUserDetails(
      req.params.userId,
      req.body ?? {},
    )

    return res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      data: { user },
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to update user details.',
    })
  }
}

export async function addAddressForUser(req, res) {
  try {
    const user = await addUserAddress(req.params.userId, req.body ?? {})

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: { user },
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to add address.',
    })
  }
}

export async function editAddressForUser(req, res) {
  try {
    const user = await updateUserAddress(
      req.params.userId,
      req.params.addressId,
      req.body ?? {},
    )

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: { user },
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to update address.',
    })
  }
}

export async function deleteAddressForUser(req, res) {
  try {
    const user = await removeUserAddress(
      req.params.userId,
      req.params.addressId,
    )

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
      data: { user },
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to delete address.',
    })
  }
}