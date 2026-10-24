import User from "../../../models/User.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function findUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("User account was not found.", 404);
  }

  return user;
}

function cleanAddress(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createError("Address details must be an object.", 400);
  }

  const address = {};

  for (const field of [
    "label",
    "recipientName",
    "phone",
    "addressLine",
    "area",
    "city"
  ]) {
    if (Object.hasOwn(input, field)) {
      if (typeof input[field] !== "string") {
        throw createError(`${field} must be text.`, 400);
      }

      address[field] = input[field].trim();
    }
  }

  if (!address.addressLine) {
    throw createError("Address line is required.", 400);
  }

  if (Object.hasOwn(input, "isDefault")) {
    if (typeof input.isDefault !== "boolean") {
      throw createError("isDefault must be true or false.", 400);
    }

    address.isDefault = input.isDefault;
  }

  return address;
}

export async function getMyAddresses(userId) {
  const user = await findUser(userId);
  return user.addresses;
}

export async function addMyAddress(userId, input) {
  const user = await findUser(userId);
  const address = cleanAddress(input);

  if (address.isDefault === true || user.addresses.length === 0) {
    user.addresses.forEach((savedAddress) => {
      savedAddress.isDefault = false;
    });
    address.isDefault = true;
  }

  user.addresses.push(address);
  await user.save();

  return user.addresses;
}
function cleanAddressChanges(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createError("Address changes must be an object.", 400);
  }

  const changes = {};

  for (const field of [
    "label",
    "recipientName",
    "phone",
    "addressLine",
    "area",
    "city"
  ]) {
    if (Object.hasOwn(input, field)) {
      if (typeof input[field] !== "string") {
        throw createError(`${field} must be text.`, 400);
      }

      changes[field] = input[field].trim();
    }
  }

  if (Object.hasOwn(changes, "addressLine") && !changes.addressLine) {
    throw createError("Address line cannot be empty.", 400);
  }

  if (Object.hasOwn(input, "isDefault")) {
    if (typeof input.isDefault !== "boolean") {
      throw createError("isDefault must be true or false.", 400);
    }

    changes.isDefault = input.isDefault;
  }

  if (Object.keys(changes).length === 0) {
    throw createError("Provide at least one address change.", 400);
  }

  return changes;
}

export async function updateMyAddress(userId, addressId, input) {
  const user = await findUser(userId);
  const address = user.addresses.id(addressId);

  if (!address) {
    throw createError("Address was not found.", 404);
  }

  const changes = cleanAddressChanges(input);

  if (changes.isDefault === true) {
    user.addresses.forEach((savedAddress) => {
      savedAddress.isDefault = false;
    });
  }

  Object.assign(address, changes);
  await user.save();

  return user.addresses;
}

export async function deleteMyAddress(userId, addressId) {
  const user = await findUser(userId);
  const address = user.addresses.id(addressId);

  if (!address) {
    throw createError("Address was not found.", 404);
  }

  const wasDefault = address.isDefault;
  user.addresses.pull(addressId);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
}
