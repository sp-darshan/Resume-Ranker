import express from 'express'
import { registerUser, getUserTokens, deductTokens } from '../controllers/userController.js'
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js'

const router = express.Router()

// Apply middleware to both routes
router.post('/register', verifyClerkAuth, registerUser)
router.get('/tokens', verifyClerkAuth, getUserTokens)
router.post('/deduct', verifyClerkAuth, deductTokens)

export default router