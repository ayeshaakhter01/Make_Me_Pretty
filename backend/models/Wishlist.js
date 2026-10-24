import mongoose from "mongoose";
const wishlistSchema = new mongoose.Schema({ customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true }, products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] }, { timestamps: true });
export default mongoose.model("Wishlist", wishlistSchema);
