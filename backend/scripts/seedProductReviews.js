
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");

await mongoose.connect(process.env.MONGODB_URI);

try {
  const names = ["Nadia Rahman", "Sadia Karim", "Maliha Noor"];
  const customers = [];

  for (let i = 0; i < names.length; i++) {
    const email = `demo.review${i + 1}@example.test`;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: names[i],
        email,
        password: process.env.DEMO_ACCOUNT_PASSWORD || "MmpDemo2026!",
        role: "customer",
        isDemo: true
      });
    }

    customers.push(user);
  }

  const products = await Product.find({});
  const reviews = [
    { rating: 5, title: "Great product", text: (p) => `I enjoyed trying ${p.name}. The product details were helpful, and it was easy to include in my routine.` },
    { rating: 4, title: "Nice everyday option", text: (p) => `${p.name} seems like a nice option for a skincare routine. I like the product presentation and overall convenience.` },
    { rating: 3, title: "Decent experience", text: (p) => `${p.name} looks interesting. My experience was average, so I would consider the product details before buying again.` }
  ];

  let count = 0;

  for (const product of products) {
    for (let i = 0; i < 3; i++) {
      await Review.updateOne(
        { customer: customers[i]._id, product: product._id },
        {
          $set: {
            customerName: customers[i].name,
            rating: reviews[i].rating,
            title: reviews[i].title,
            text: reviews[i].text(product),
            status: "approved",
            isDemo: true
          }
        },
        { upsert: true, runValidators: true }
      );

      count++;
    }
  }

  console.log(`Products found: ${products.length}`);
  console.log(`Demo reviews created/updated: ${count}`);
} finally {
  await mongoose.disconnect();
}
