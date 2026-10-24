import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";

const password = process.env.DEMO_ACCOUNT_PASSWORD || "MmpDemo2026!";
if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env.");
if (password.length < 8) throw new Error("DEMO_ACCOUNT_PASSWORD must be at least 8 characters.");
await mongoose.connect(process.env.MONGODB_URI);
try {
  const addresses = [
    { label: "Home", recipientName: "Demo Customer", phone: "01700001001", addressLine: "House 12, Road 4", area: "Dhanmondi", city: "Dhaka", isDefault: true },
    { label: "Home", recipientName: "Demo Customer", phone: "01700001002", addressLine: "Flat 3B, Road 8", area: "Uttara", city: "Dhaka", isDefault: true },
    { label: "Home", recipientName: "Demo Customer", phone: "01700001003", addressLine: "House 5, Road 2", area: "Panchlaish", city: "Chattogram", isDefault: true },
    { label: "Home", recipientName: "Demo Customer", phone: "01700001004", addressLine: "House 9, Road 10", area: "Nasirabad", city: "Chattogram", isDefault: true },
    { label: "Home", recipientName: "Demo Customer", phone: "01700001005", addressLine: "Flat 2A, Road 6", area: "Mirpur", city: "Dhaka", isDefault: true },
    { label: "Home", recipientName: "Demo Customer", phone: "01700001006", addressLine: "House 7, Road 3", area: "Khulshi", city: "Chattogram", isDefault: true },
  ];
  const definitions = [
    { name: "Demo Store Admin", email: "demo.admin@example.test", role: "admin", phone: "01700001999" },
    ...addresses.map((address, index) => ({ name: ["Nadia Rahman", "Sadia Karim", "Maliha Noor", "Raisa Ahmed", "Tania Islam", "Mim Chowdhury"][index], email: `demo.customer${index + 1}@example.test`, role: "customer", phone: address.phone, addresses: [address] })),
    { name: "Demo Delivery One", email: "demo.delivery1@example.test", role: "deliveryPartner", phone: "01700001801" },
    { name: "Demo Delivery Two", email: "demo.delivery2@example.test", role: "deliveryPartner", phone: "01700001802" },
  ];
  const users = [];
  for (const definition of definitions) {
    const user = await User.findOne({ email: definition.email }).select("+password");
    const record = user || new User({ email: definition.email });
    Object.assign(record, { ...definition, password, isDemo: true });
    await record.save();
    users.push(record);
  }
  const customers = users.filter((user) => user.role === "customer");
  const partners = users.filter((user) => user.role === "deliveryPartner");
  const products = await Product.find({ active: true }).sort({ brand: 1, name: 1 }).lean();
  if (products.length < 12) throw new Error(`Need at least 12 active catalog products; found ${products.length}. Seed catalog first.`);

  let ordersCreated = 0;
  const statuses = ["delivered", "delivered", "shipped", "confirmed", "delivered", "pending", "outForDelivery", "delivered", "cancelled", "shipped", "delivered", "confirmed", "delivered", "pending", "shipped", "delivered", "confirmed", "delivered", "outForDelivery", "shipped", "delivered", "cancelled", "confirmed", "delivered", "pending", "delivered", "shipped", "confirmed", "delivered", "outForDelivery"];
  for (let index = 0; index < statuses.length; index += 1) {
    const orderNumber = `MMP-DEMO-${String(index + 1).padStart(4, "0")}`;
    if (await Order.exists({ orderNumber })) continue;
    const customer = customers[index % customers.length];
    const product = products[(index * 7) % products.length];
    const address = customer.addresses[0];
    const status = statuses[index];
    const quantity = index % 7 === 0 ? 2 : 1;
    const deliveryCharge = product.price * quantity >= 3000 ? 0 : address.city === "Chattogram" ? 60 : 120;
    const delivered = status === "delivered";
    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      deliveryPartner: index % 5 === 0 ? null : partners[index % partners.length]._id,
      items: [{ product: product._id, name: product.name, image: product.images?.[0] || "", quantity, price: product.price }],
      address: { recipientName: customer.name, phone: address.phone, addressLine: address.addressLine, area: address.area, city: address.city },
      subtotal: product.price * quantity,
      deliveryCharge,
      discount: 0,
      total: product.price * quantity + deliveryCharge,
      paymentMethod: "cod",
      paymentStatus: delivered ? "paid" : "unpaid",
      status,
      isDemo: true,
      createdAt: new Date(Date.now() - (index * 2 + 1) * 24 * 60 * 60 * 1000),
    });
    if (status !== "cancelled") await Product.updateOne({ _id: product._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
    ordersCreated += 1;
  }

  let reviewsUpserted = 0;
  const reviewExamples = [
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
  for (let index = 0; index < 30; index += 1) {
    const customer = customers[index % customers.length];
    const product = products[index % products.length];
    const example = reviewExamples[index % reviewExamples.length];
    const status = index % 6 === 0 ? "pending" : "approved";
    await Review.updateOne({ customer: customer._id, product: product._id }, { $set: {
      customerName: customer.name,
      rating: example.rating,
      title: example.title,
      text: example.text,
      status,
      isDemo: true,
    } }, { upsert: true, runValidators: true });
    reviewsUpserted += 1;
  }

  for (let index = 0; index < 3; index += 1) {
    const customer = customers[index];
    const first = products[(index * 3) % products.length];
    const second = products[(index * 3 + 4) % products.length];
    await Cart.updateOne({ customer: customer._id }, { $set: { items: [{ product: first._id, quantity: 1 }, { product: second._id, quantity: 1 }] } }, { upsert: true });
    await Wishlist.updateOne({ customer: customer._id }, { $set: { products: [first._id, second._id, products[(index * 3 + 7) % products.length]._id] } }, { upsert: true });
  }

  console.log(JSON.stringify({
    demoUsers: users.map(({ name, email, role }) => ({ name, email, role })),
    sharedDemoPassword: password,
    newOrders: ordersCreated,
    sampleReviews: reviewsUpserted,
    currentActiveProducts: products.length,
  }, null, 2));
} finally {
  await mongoose.disconnect();
}
