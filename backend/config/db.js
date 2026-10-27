import mongoose from "mongoose";

let connecting;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch((error) => {
        connecting = null;
        throw error;
      });
  }
  await connecting;
};

export default connectDB;