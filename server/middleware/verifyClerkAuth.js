import { verifyToken } from '@clerk/backend'

export const verifyClerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header missing or malformed'
      })
    }

    const token = authHeader.split(' ')[1]?.trim()

    if (!token) {
      return res.status(401).json({
        error: 'Bearer token missing'
      })
    }

    // Verify token using Clerk's backend SDK
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    })

    // Attach decoded user info to request
    req.user = decoded
    console.log('Verified Clerk ID:', decoded.sub) // Debug log

    next()
  } catch (err) {
    console.error('Token verification failed:', err)
    res.status(403).json({
      error: 'Unauthorized',
      detail: err.message
    })
  }
}