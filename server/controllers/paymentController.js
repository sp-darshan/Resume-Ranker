import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/userModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Razorpay Order
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
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating Razorpay order" });
  }
};

// 2️⃣ Verify Payment and Update Tokens
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId: email, tokensToAdd } = req.body;
    console.log("🔹 Verification started");

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
      console.log("❌ Invalid signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Payment Verified - Now Update User Tokens
    console.log("✅ Payment verified successfully");

    if (!email || !tokensToAdd) {
      return res
        .status(400)
        .json({ success: false, message: "Missing user or token info" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email }, // match by Clerk ID (make sure it's stored in user model)
      { $inc: { tokens: tokensToAdd } }, // increment existing tokens
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(`🎉 Added ${tokensToAdd} tokens to user ${email}`);
    return res.json({
      success: true,
      message: "Payment verified & tokens added successfully",
      tokens: updatedUser.tokens,
    });
  } catch (error) {
    console.error("❌ Verify error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};
