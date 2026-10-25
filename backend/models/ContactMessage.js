import mongoose from "mongoose";

export const CONTACT_MESSAGE_STATUSES = ["new", "inProgress", "resolved", "archived"];

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, default: "", trim: true, maxlength: 30 },
  subject: { type: String, default: "", trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
  status: { type: String, enum: CONTACT_MESSAGE_STATUSES, default: "new" },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
