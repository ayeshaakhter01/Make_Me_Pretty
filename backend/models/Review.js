import mongoose from "mongoose";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"];

const reviewSchema = new mongoose.Schema(
  {
    // The User and Product models are built by Akhi and Fahmida.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Name shown on the review (copied at the time of writing).
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5",
      },
    },
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    // URL or path of the optional photo. Empty = no photo.
    image: {
      type: String,
      default: "",
      trim: true,
    },
    // New reviews wait for admin approval.
    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: "pending",
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per customer per product.
reviewSchema.index({ customer: 1, product: 1 }, { unique: true });
// Fast "approved reviews of this product" lookups.
reviewSchema.index({ product: 1, status: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
