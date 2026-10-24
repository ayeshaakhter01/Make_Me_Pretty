import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({ customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true }, items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, quantity: { type: Number, min: 1, required: true } }] }, { timestamps: true });
export default mongoose.model("Cart", cartSchema);
