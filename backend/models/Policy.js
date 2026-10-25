import mongoose from "mongoose";

// One document per policy page (Refund, Privacy, Delivery, Terms and any new one).
// The page address is /p/<slug>.
const policySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 80 },
  content: { type: String, default: "", maxlength: 50000 },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Policy", policySchema);
