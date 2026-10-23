// Pure rating logic. Feed it the ratings of APPROVED reviews only.

export const calculateRatingSummary = (ratings = []) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;

  for (const rating of ratings) {
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      distribution[rating] += 1;
      sum += rating;
      count += 1;
    }
  }

  // One decimal place, for example 4.3. No reviews means 0.
  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;

  return { average, count, distribution };
};
