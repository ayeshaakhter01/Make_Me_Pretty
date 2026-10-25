import User from "../../../models/User.js";
import Order from "../../../models/Order.js";
import Cart from "../../../models/Cart.js";
import Wishlist from "../../../models/Wishlist.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

async function findUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("User account was not found.", 404);
  }

  return user;
}

export async function getMyProfile(userId) {
  const user = await findUser(userId);
  return publicUser(user);
}

export async function updateMyProfile(userId, changes = {}) {
  const user = await findUser(userId);

  if (Object.hasOwn(changes, "name")) {
    if (typeof changes.name !== "string" || !changes.name.trim()) {
      throw createError("Name cannot be empty.", 400);
    }

    user.name = changes.name.trim();
  }

  if (Object.hasOwn(changes, "phone")) {
    if (changes.phone !== null && typeof changes.phone !== "string") {
      throw createError("Phone must be text.", 400);
    }

    user.phone = changes.phone?.trim() || undefined;
  }

  if (Object.hasOwn(changes, "email")) {
    if (typeof changes.email !== "string" || !changes.email.trim()) {
      throw createError("Email cannot be empty.", 400);
    }
    const email = changes.email.trim().toLowerCase();
    const duplicate = await User.exists({ email, _id: { $ne: user._id } });
    if (duplicate) throw createError("Another account already uses this email.", 409);
    user.email = email;
  }

  await user.save();
  return publicUser(user);
}

export async function changeMyPassword(userId, { currentPassword, newPassword } = {}) {
  if (typeof currentPassword !== "string" || !currentPassword || typeof newPassword !== "string") {
    throw createError("Current and new passwords are required.", 400);
  }
  if (newPassword.length < 8) throw createError("New password must be at least 8 characters.", 400);
  const user = await User.findById(userId).select("+password");
  if (!user) throw createError("User account was not found.", 404);
  if (!(await user.comparePassword(currentPassword))) throw createError("Current password is incorrect.", 401);
  user.password = newPassword;
  await user.save();
}
const USER_ROLES = ["customer", "admin", "deliveryPartner"];

function adminUserSummary(user) {
  const addresses = (user.addresses ?? []).map((item) => ({
    id: item._id.toString(),
    label: item.label,
    recipientName: item.recipientName,
    phone: item.phone,
    addressLine: item.addressLine,
    area: item.area,
    city: item.city,
    isDefault: item.isDefault,
  }))

  const mainAddress =
    addresses.find((item) => item.isDefault) ?? addresses[0]

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: mainAddress
      ? [mainAddress.addressLine, mainAddress.area, mainAddress.city]
          .filter(Boolean)
          .join(', ')
      : '',
    addresses,
    role: user.role,
    joined: user.createdAt,
    orders: 0,
  }
}

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(adminUserSummary);
}

export async function changeUserRole(userId, role, actorId) {
  if (!USER_ROLES.includes(role)) {
    throw createError("Choose a valid user role.", 400);
  }

  const user = await findUser(userId);

  if (userId === actorId.toString() && role !== "admin") {
    throw createError("You cannot remove your own admin role.", 400);
  }

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw createError("You cannot change the role of the last admin.", 400);
    }
  }

  user.role = role;
  await user.save();

  return adminUserSummary(user);
}

export async function removeUser(userId, actorId) {
  if (userId === actorId.toString()) {
    throw createError("You cannot delete your own account here.", 400);
  }

  const user = await findUser(userId);

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw createError("You cannot delete the last admin.", 400);
    }
  }

  if (user.role === "deliveryPartner" && await Order.exists({ deliveryPartner: user._id, status: { $in: ["confirmed", "shipped", "outForDelivery"] } })) {
    throw createError("This delivery partner still has active orders. Reassign them first.", 409);
  }
  await Promise.all([Cart.deleteOne({ customer: user._id }), Wishlist.deleteOne({ customer: user._id })]);
  
  await user.deleteOne();

  return { id: userId };
}
export async function createStaffUser({ name, email, password, role, phone }) {
  if (!["admin", "deliveryPartner"].includes(role)) {
    throw createError("Staff role must be admin or deliveryPartner.", 400);
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string"
  ) {
    throw createError("Name, email, and password are required.", 400);
  }

  if (password.length < 8) {
    throw createError("Password must be at least 8 characters.", 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    throw createError("An account with this email already exists.", 409);
  }

  if (phone != null && typeof phone !== 'string') {
  throw createError('Phone must be text.', 400)
}

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    role,
    phone: phone?.trim() || undefined
  });

  return adminUserSummary(user);
}

export async function updateUserDetails(userId, changes = {}) {
  const user = await findUser(userId)

  if (Object.hasOwn(changes, 'name')) {
    if (typeof changes.name !== 'string' || !changes.name.trim()) {
      throw createError('Name cannot be empty.', 400)
    }
    user.name = changes.name.trim()
  }

  if (Object.hasOwn(changes, 'email')) {
    if (typeof changes.email !== 'string' || !changes.email.trim()) {
      throw createError('Email cannot be empty.', 400)
    }

    const email = changes.email.trim().toLowerCase()
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id },
    })

    if (existingUser) {
      throw createError('Another account already uses this email.', 409)
    }

    user.email = email
  }

  if (Object.hasOwn(changes, 'phone')) {
    if (changes.phone !== null && typeof changes.phone !== 'string') {
      throw createError('Phone must be text.', 400)
    }
    user.phone = changes.phone?.trim() || undefined
  }

  await user.save()
  return adminUserSummary(user)
}

const ADDRESS_FIELDS = [
  'label',
  'recipientName',
  'phone',
  'addressLine',
  'area',
  'city',
]

function cleanAddress(input = {}, partial = false) {
  const address = {}

  for (const field of ADDRESS_FIELDS) {
    if (partial && !Object.hasOwn(input, field)) continue

    if (typeof input[field] !== 'string' || !input[field].trim()) {
      throw createError(`${field} is required.`, 400)
    }

    address[field] = input[field].trim()
  }

  if (Object.hasOwn(input, 'isDefault')) {
    if (typeof input.isDefault !== 'boolean') {
      throw createError('isDefault must be true or false.', 400)
    }
    address.isDefault = input.isDefault
  }

  return address
}

export async function addUserAddress(userId, input = {}) {
  const user = await findUser(userId)
  const address = cleanAddress(input)
  const makeDefault = Boolean(address.isDefault) || user.addresses.length === 0

  if (makeDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = false
    })
  }

  user.addresses.push({ ...address, isDefault: makeDefault })
  await user.save()
  return adminUserSummary(user)
}

export async function updateUserAddress(userId, addressId, changes = {}) {
  const user = await findUser(userId)
  const address = user.addresses.id(addressId)

  if (!address) {
    throw createError('Saved address was not found.', 404)
  }

  const cleaned = cleanAddress(changes, true)
  const wasDefault = Boolean(address.isDefault)

  if (cleaned.isDefault === true) {
    user.addresses.forEach((item) => {
      item.isDefault = false
    })
  }

  Object.assign(address, cleaned)

  if (wasDefault && cleaned.isDefault === false) {
    const replacement = user.addresses.find(
      (item) => item._id.toString() !== addressId,
    )
    if (replacement) replacement.isDefault = true
  }

  await user.save()
  return adminUserSummary(user)
}

export async function removeUserAddress(userId, addressId) {
  const user = await findUser(userId)
  const address = user.addresses.id(addressId)

  if (!address) {
    throw createError('Saved address was not found.', 404)
  }

  const wasDefault = Boolean(address.isDefault)
  user.addresses.pull({ _id: addressId })

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true
  }

  await user.save()
  return adminUserSummary(user)
}
