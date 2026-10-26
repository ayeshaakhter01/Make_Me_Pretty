import mongoose from "mongoose";

const aboutSectionSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true, maxlength: 100 },
    text: { type: String, required: true, maxlength: 5000 },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("AboutSection", aboutSectionSchema, "aboutus");
