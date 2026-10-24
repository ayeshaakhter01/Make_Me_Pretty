
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const missing = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    console.error(`Missing required backend environment values: ${missing.join(", ")}. Add them to backend/.env and restart.`);
    process.exit(1);
  }
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Make Me Pretty API running on port ${PORT}`);
  });
};

startServer();
