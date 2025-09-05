import express from 'express'
import { clerkWebhooks } from '../controllers/userController.js'

const userRouter = express.Router()

// Use express.raw if Clerk signature verification fails with express.json
userRouter.post('/webhooks', express.json({ type: '*/*' }), clerkWebhooks)

export default userRouter