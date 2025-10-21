import User from '../models/userModel.js'

const registerUser = async (req, res) => {
  try {
    // Get Clerk ID from verified token (middleware sets req.user)
    const clerkId = req.user?.sub
    const { uid, username, firstname, lastname, email } = req.body

    // Check if user already exists by email or Clerk ID
    const existingUser = await User.findOne({
      $or: [{ email }, { uid: clerkId }]
    })

    if (existingUser) {
      // Update existing user with Clerk ID if needed
      if (!existingUser.uid || existingUser.uid !== clerkId) {
        existingUser.uid = clerkId
        await existingUser.save()
      }
      return res.status(200).json({
        message: 'User already exists',
        user: existingUser
      })
    }

    // Create new user with Clerk ID
    const newUser = await User.create({
      uid: clerkId, // Use Clerk ID instead of UUID
      username,
      firstname,
      lastname,
      email,
      tokens: 5
    })

    res.status(201).json({
      message: 'User Registered Successfully',
      user: newUser
    })
  } catch (err) {
    console.error('Register user error:', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}

const getUserTokens = async (req, res) => {
  try {
    // Get Clerk ID from verified token (middleware sets req.user)
    const clerkId = req.user?.sub

    if (!clerkId) {
      return res.status(401).json({
        message: 'Unauthorized: No user ID found'
      })
    }

    // Find user by Clerk ID
    const user = await User.findOne({ uid: clerkId })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        uid: clerkId
      })
    }

    // Return tokens count
    res.status(200).json({
      tokens: user.tokens,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email
      }
    })
  } catch (err) {
    console.error('Get user tokens error:', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}

export { registerUser, getUserTokens }