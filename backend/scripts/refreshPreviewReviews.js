import "dotenv/config";
import mongoose from "mongoose";
import Review from "../models/Review.js";

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
const examples = [
  { rating: 5, title: "Light and comfortable", text: "The texture is light and it settles in quickly. I like how it feels under sunscreen during the day." },
  { rating: 4, title: "A nice everyday option", text: "Easy to fit into my routine and the packaging is practical. I would have liked a little more product for the price." },
  { rating: 3, title: "Good, with a small drawback", text: "It does the basic job well, but the scent is stronger than I expected. I would choose an unscented option next time." },
  { rating: 2, title: "Not quite right for me", text: "The product itself is fine, but it felt heavier than I prefer and took longer to absorb. It may suit someone who likes a richer texture." },
  { rating: 5, title: "Would happily use again", text: "Simple to use and comfortable on my skin. I noticed no pilling with the other products in my routine." },
  { rating: 4, title: "Pleasant and easy to use", text: "A pleasant formula that spreads easily. The result is good, although the bottle could be easier to handle with wet hands." },
  { rating: 3, title: "Average experience", text: "It works as described, but I did not notice a dramatic difference. The size is convenient for trying it first." },
  { rating: 5, title: "A routine favourite", text: "I reach for this often because it feels comfortable and does not leave a sticky finish. The product details were clear." },
  { rating: 2, title: "The finish was too rich", text: "The finish felt a little too rich for my preference. I would recommend checking the texture description before choosing it." },
  { rating: 4, title: "Good value for daily use", text: "A solid daily-use product with a texture I enjoy. It is not a miracle fix, but it has been a useful part of my routine." },
  { rating: 5, title: "Gentle on my routine", text: "I appreciate that it layers comfortably with the rest of my routine. The amount needed each time is small." },
  { rating: 3, title: "Fine, but not a standout", text: "Nothing was wrong with it, though I expected a little more from the description. I would consider it again if the price were lower." },
];

await mongoose.connect(process.env.MONGODB_URI);
try {
  const reviews = await Review.find({ isDemo: true }).sort({ createdAt: 1 });
  for (const [index, review] of reviews.entries()) {
    const example = examples[index % examples.length];
    review.rating = example.rating;
    review.title = example.title;
    review.text = example.text;
    await review.save();
  }
  console.log(`Updated ${reviews.length} generated review examples with varied ratings and natural wording.`);
} finally {
  await mongoose.disconnect();
}
