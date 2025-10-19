// middleware/verifyClerkAuth.js
import { clerkClient, verifyToken } from '@clerk/express';

export const verifyClerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token using Clerk's Express SDK
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ message: "Unauthorized", error: err.message });
  }
};
