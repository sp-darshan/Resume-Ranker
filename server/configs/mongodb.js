import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // Avoid reconnecting
  mongoose.connection.on("connected", () => {
    console.log("Database Connected");
  });
  await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;
