import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/routes/authRoutes.js";
import userRoutes from "./modules/users/routes/userRoutes.js";
import adminUserRoutes from "./modules/users/routes/adminUserRoutes.js";
import blogRoutes from "./modules/blogs/routes/blogRoutes.js";
import bannerRoutes from "./modules/banners/routes/bannerRoutes.js";
import couponRoutes from "./modules/coupons/routes/couponRoutes.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { requireRole } from "./middlewares/roleMiddleware.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import uploadRoutes from "./modules/uploads/routes/uploadRoutes.js";
import { productRoutes, categoryRoutes } from "./modules/catalog/routes/catalogRoutes.js";
import brandRoutes from "./modules/brands/routes/brandRoutes.js";
import orderRoutes from "./modules/orders/routes/orderRoutes.js";
import { cartRoutes, wishlistRoutes } from "./modules/shopping/routes/shoppingRoutes.js";
import { productReviewRoutes, adminReviewRoutes, publicReviewRoutes } from "./modules/reviews/routes/reviewRoutes.js";
import skinAdvisorRoutes from "./modules/skinAdvisor/routes/skinAdvisorRoutes.js";
import reportRoutes from "./modules/reports/routes/reportRoutes.js";
import deliveryRoutes from "./modules/delivery/routes/deliveryRoutes.js";
import siteSettingsRoutes from "./modules/siteSettings/routes/siteSettingsRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import policyRoutes from "./modules/policies/routes/policyRoutes.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
}, methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

const backendDir = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(backendDir, "uploads"), { fallthrough: false, immutable: true, maxAge: "7d" }));
app.use("/api/uploads", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productReviewRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/reviews", publicReviewRoutes);
app.use("/api/admin/reports", requireAuth, requireRole("admin"), reportRoutes);
app.use("/api/skin-advisor", skinAdvisorRoutes);
app.use("/api/site-settings", siteSettingsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", requireAuth, requireRole("admin"), adminUserRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Make Me Pretty API is running!"
  });
});

app.use(errorMiddleware);

export default app;
