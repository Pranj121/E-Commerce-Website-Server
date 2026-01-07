import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

/* =========================
   CREATE ORDER
   POST /api/payment/create-order
========================= */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Razorpay expects amount in paise
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/* =========================
   VERIFY PAYMENT  ✅ IMPORTANT
   POST /api/payment/verify
========================= */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ PAYMENT VERIFIED
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // ❌ SIGNATURE MISMATCH
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

export default router;
