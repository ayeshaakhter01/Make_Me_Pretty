import express from "express";
import cors from "cors";
import blogRoutes from "./routes/blogRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
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
