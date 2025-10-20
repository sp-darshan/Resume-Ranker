import express from "express"
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cors from 'cors'
import userRoutes from "./routes/userRoutes.js"; 

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// To verify backend hosting
app.get("/", (req, res) => {
  res.send("Resume Ranker backend is live and running!");
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: "ResumeRankerDB",
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection failed:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
