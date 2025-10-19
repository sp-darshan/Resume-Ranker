import User from '../models/userModel.js'

const registerUser = async (req, res) => {
    try{
        const { uid, username, firstname, lastname, email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res.status(200).json({ message: "User already exists"});
        } 

        const newUser = await User.create({
            uid, username, firstname, lastname, email, tokens: 5,   
        });

        res.status(201).json({
            message: "User Registered Successfully",
            user: newUser,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message});
    }
};

const getUserTokens = async (req, res) => {
  try {
    // Clerk middleware added req.user or req.auth
    const userId = req.user?.sub || req.auth?.userId; // 'sub' is standard claim in JWT

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // Find user by Clerk UID (stored as uid in Mongo)
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return tokens count
    res.status(200).json({ tokens: user.tokens });
  } catch (err) {
    console.error("Error fetching tokens:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { registerUser, getUserTokens };