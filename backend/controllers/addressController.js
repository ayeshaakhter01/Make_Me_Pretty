import {
  addMyAddress,
  deleteMyAddress,
  getMyAddresses,
  updateMyAddress
} from "../services/addressService.js";

export async function getAddresses(req, res) {
  try {
    const addresses = await getMyAddresses(req.user._id);

    return res.status(200).json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to load addresses."
    });
  }
}

export async function addAddress(req, res) {
  try {
    const addresses = await addMyAddress(req.user._id, req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: { addresses }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to add address."
    });
  }
}

export async function updateAddress(req, res) {
  try {
    const addresses = await updateMyAddress(
      req.user._id,
      req.params.addressId,
      req.body ?? {}
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: { addresses }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to update address."
    });
  }
}

export async function deleteAddress(req, res) {
  try {
    const addresses = await deleteMyAddress(
      req.user._id,
      req.params.addressId
    );

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      data: { addresses }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to delete address."
    });
  }
}