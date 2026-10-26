import mongoose from "mongoose";

const paymentLogoSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    label: { type: String, required: true, maxlength: 80 },
    src: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentLogo", paymentLogoSchema, "paymentlogos");
