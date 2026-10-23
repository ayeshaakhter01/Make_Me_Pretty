import mongoose from "mongoose";

export const BANNER_TYPES = ["image", "video"];

// One homepage hero slide.
const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: BANNER_TYPES,
      default: "image",
    },
    // URL or path only, for example /media/hero/offers.png
    src: {
      type: String,
      required: true,
      trim: true,
    },
    href: {
      type: String,
      default: "/shop",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
