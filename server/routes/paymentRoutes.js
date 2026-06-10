import express from 'express'
import { createOrder, verifyPayment } from '../controllers/paymentController.js'
import { verifyClerkAuth } from '../middleware/verifyClerkAuth.js'

const router = express.Router()

router.post('/create-order', verifyClerkAuth, createOrder)
router.post('/verify', verifyClerkAuth, verifyPayment)

export default router