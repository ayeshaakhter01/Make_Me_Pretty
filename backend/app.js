import express from "express";
import cors from "cors";
import blogRoutes from "./routes/blogRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Make Me Pretty API is running!"
  });
});

export default app;
