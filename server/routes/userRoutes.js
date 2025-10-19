import express from 'express'
import { registerUser, getUserTokens } from '../controllers/userController.js'
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js';

const router = express.Router();

router.post("/register", verifyClerkAuth, registerUser);
router.get("/tokens", verifyClerkAuth, getUserTokens);

export default router;