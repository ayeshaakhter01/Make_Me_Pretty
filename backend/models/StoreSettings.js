import mongoose from "mongoose";

const policyPageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    content: { type: String, required: true, maxlength: 50000 },
    published: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "storefront" },
    logo: { type: String, default: "" },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        helpLinks: [],
        policyLinks: [],
        socials: [],
        payments: [],
      }),
    },
    // From main (About Us and Contact content)
    about: { type: mongoose.Schema.Types.Mixed, default: () => [] },
    contact: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    // From FYasmin12-branch (older policy storage, kept so no data is lost)
    policyPages: {
      type: [policyPageSchema],
      default: [],
    },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("StoreSettings", storeSettingsSchema);