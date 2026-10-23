
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminUserRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Make Me Pretty API is running!"
  });
});

export default app;
