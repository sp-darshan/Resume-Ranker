import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ResumeRankerDB",
    });
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit process if DB fails to connect
  }
};
