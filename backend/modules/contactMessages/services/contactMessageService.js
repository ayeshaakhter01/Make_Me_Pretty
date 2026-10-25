import ContactMessage, { CONTACT_MESSAGE_STATUSES } from "../../../models/ContactMessage.js";
import AppError from "../../../utils/AppError.js";
import { validateContactMessageStatus, validateContactMessageSubmission } from "../../../validators/contactMessageValidator.js";

export async function createContactMessage(data) {
  const validation = validateContactMessageSubmission(data);
  if (!validation.isValid) throw new AppError(validation.errors.join(". "), 400);
  return ContactMessage.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || "",
    subject: data.subject?.trim() || "",
    message: data.message.trim(),
  });
}

export async function listContactMessages(status = "all") {
  if (status !== "all" && !CONTACT_MESSAGE_STATUSES.includes(status)) {
    throw new AppError(`Status must be one of: all, ${CONTACT_MESSAGE_STATUSES.join(", ")}`, 400);
  }
  const filter = status === "all" ? {} : { status };
  return ContactMessage.find(filter).sort({ createdAt: -1 }).limit(300).select("-__v").lean();
}

export async function updateContactMessageStatus(id, data) {
  const validation = validateContactMessageStatus(data);
  if (!validation.isValid) throw new AppError(validation.errors.join(". "), 400);
  const update = { $set: { status: data.status } };
  if (data.status === "resolved") update.$set.resolvedAt = new Date();
  else update.$unset = { resolvedAt: 1 };
  const message = await ContactMessage.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select("-__v").lean();
  if (!message) throw new AppError("Contact message not found.", 404);
  return message;
}
