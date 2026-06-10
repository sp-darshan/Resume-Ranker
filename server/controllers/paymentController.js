import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/userModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating Razorpay order" });
  }
};

// Verify Payment and Update Tokens
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tokensToAdd
    } = req.body;
    
    const clerkId = req.user?.sub;

    console.log("Verification started");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required payment fields" });
    }

    // Compute expected signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    console.log("Expected Sign:", expectedSign);
    console.log("Received Sign:", razorpay_signature);

    if (razorpay_signature !== expectedSign) {
      console.log("Invalid signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Payment Verified - Now Update User Tokens
    console.log("Payment verified successfully");

    const tokenAmount = parseInt(tokensToAdd, 10)

    if (!clerkId || !Number.isFinite(tokenAmount) || tokenAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing user or token info" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: clerkId },
      { $inc: { tokens: tokenAmount } },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(`Added ${tokenAmount} tokens to user ${clerkId}`);
    return res.json({
      success: true,
      message: "Payment verified & tokens added successfully",
      tokens: updatedUser.tokens,
    });
  } catch (error) {
    console.error("Verify error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};
