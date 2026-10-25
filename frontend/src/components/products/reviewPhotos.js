/* All photos of a review (new reviews have `images`; older ones only have `image`). */
export function getReviewPhotos(review) {
  if (Array.isArray(review?.images) && review.images.length) return review.images
  return review?.image ? [review.image] : []
}
