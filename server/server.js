import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoute.js';

// Create app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB (do not use top-level await)
connectDB().catch(err => console.error("DB connection failed:", err));

// Routes
app.get('/', (req, res) => {
  res.send("API working");
});

app.use('/api/user', userRouter)


export default app;
