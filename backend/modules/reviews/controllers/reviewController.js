import * as service from "../services/reviewService.js";
const wrap = (fn, status = 200) => async (req, res, next) => { try { res.status(status).json({ success: true, data: await fn(req) }); } catch (error) { next(error); } };
export const productReviews = wrap((req) => service.listProductReviews(req.params.productId));
export const homepageReviews = wrap(() => service.listHomepageReviews());
export const submitReview = wrap((req) => service.createReview(req.user._id, req.user.name, { ...req.body, product: req.params.productId }), 201);
export const adminReviews = wrap((req) => service.listReviews(req.query.status));
export const moderateReview = wrap((req) => service.moderateReview(req.params.id, req.body));
export const deleteReview = wrap((req) => service.deleteReview(req.params.id));
