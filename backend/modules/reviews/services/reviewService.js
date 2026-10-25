import Review from "../../../models/Review.js";
import Product from "../../../models/Product.js";
import AppError from "../../../utils/AppError.js";
import { hasDeliveredOrderWithProduct } from "../../orders/services/orderService.js";
import { calculateRatingSummary } from "../../../utils/ratingCalculator.js";
import { validateReviewModeration, validateReviewSubmission } from "../../../validators/reviewValidator.js";

export async function listProductReviews(productId) {
  if (!await Product.exists({ _id: productId, active: true })) throw new AppError("Product not found.", 404);
  const reviews = await Review.find({ product: productId, status: "approved" }).sort({ createdAt: -1 }).select("-__v").lean();
  return { reviews, rating: calculateRatingSummary(reviews.map(({ rating }) => rating)) };
}
export async function createReview(customer, customerName, data) {
  const validation = validateReviewSubmission(data);
  if (!validation.isValid) throw new AppError(validation.errors.join(". "), 400);
  if (!await Product.exists({ _id: data.product, active: true })) throw new AppError("Product not found.", 404);
  if (!await hasDeliveredOrderWithProduct(customer, data.product)) throw new AppError("You can review a product after an order containing it has been delivered.", 403);
  return Review.create({ ...data, customer, customerName });
}
export async function listReviews(status) {
  const filter = status ? { status } : {};
  return Review.find(filter).sort({ createdAt: -1 }).populate("product", "name slug").populate("customer", "name email").select("-__v").lean();
}
export async function listHomepageReviews() {
  return Review.find({ status: "approved" }).sort({ createdAt: -1 }).limit(18).populate("product", "name slug").select("customerName product rating title text image isDemo createdAt").lean();
}
export async function moderateReview(id, data) {
  const validation = validateReviewModeration(data);
  if (!validation.isValid) throw new AppError(validation.errors.join(". "), 400);
  const review = await Review.findByIdAndUpdate(id, { status: data.status }, { new: true, runValidators: true }).select("-__v");
  if (!review) throw new AppError("Review not found.", 404);
  return review;
}
export async function deleteReview(id) {
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new AppError("Review not found.", 404);
  return review;
}
