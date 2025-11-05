import express from "express"
import { connectDB } from "./configs/mongodb.js";
import dotenv from 'dotenv'
import cors from 'cors'
import userRoutes from "./routes/userRoutes.js"; 
import analyzeRoute from './routes/analyzeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })) 

// Routes
app.use("/api/users", userRoutes);
app.use('/api', analyzeRoute);
app.use("/api/payments", paymentRoutes);

// To verify backend hosting
app.get("/", (req, res) => {
  res.send("Resume Ranker backend is live and running!");
});

await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
