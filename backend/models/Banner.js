import mongoose from "mongoose";

export const BANNER_TYPES = ["image", "video"];
export const BANNER_PLACEMENTS = ["hero", "pageHeader"];

// Homepage carousel slide or a page-specific header image.
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
    placement: { type: String, enum: BANNER_PLACEMENTS, default: "hero", index: true },
    pagePath: { type: String, trim: true, default: "" },
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

bannerSchema.index({ placement: 1, pagePath: 1, order: 1 });
bannerSchema.pre("validate", function () {
  if (this.placement === "pageHeader" && !this.pagePath) this.invalidate("pagePath", "A page path is required for a page header.");
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
