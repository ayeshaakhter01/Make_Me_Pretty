import mongoose from "mongoose";

// One document per brand shown in "Brands we carry".
// `name` must match the `brand` text on Product documents - that is how products are linked to a brand.
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
  description: { type: String, default: "", trim: true, maxlength: 160 },
  logo: { type: String, default: "" },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);
