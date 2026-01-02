import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body || {};

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: "Missing amount in request body" });
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: "Invalid amount; must be a positive number" });
    }

    // Razorpay expects amount in the smallest currency unit (paise)
    const amountInPaise = Math.round(amountNumber * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    // Log auth details just before calling Razorpay
    console.log("[payment.create-order] Razorpay auth key_id:", process.env.RAZORPAY_KEY_ID);
    console.log(
      "[payment.create-order] Razorpay key_secret (masked):",
      maskKey(process.env.RAZORPAY_KEY_SECRET)
    );
    if (process.env.LOG_RAZORPAY_SECRET === "true") {
      console.warn(
        "[payment.create-order] WARNING: LOG_RAZORPAY_SECRET=true — logging full secret to console"
      );
      console.log("[payment.create-order] Razorpay key_secret (FULL):", process.env.RAZORPAY_KEY_SECRET);
    }

    console.log(
      "[payment.create-order] calling razorpay.orders.create with options:",
      options,
      "(requested:", amount, "INR ->", options.amount, "paise)"
    );

    // Construct the HTTP request details that the Razorpay SDK will send.
    const razorpayUrl = "https://api.razorpay.com/v1/orders";
    const rpMethod = "POST";
    const rpBody = JSON.stringify(options);
    const id = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const authPreview = `${id}:${maskKey(secret)}`;
    const authFullBase64 = Buffer.from(`${id}:${secret}`).toString("base64");
    const authPreviewBase64 = Buffer.from(authPreview).toString("base64");

    // Log a preview of the HTTP request that will be sent. Do NOT use the masked
    // base64 value for actual requests; this is only for logging so we don't leak secrets.
    console.log("[payment.create-order] Razorpay HTTP request ->", {
      url: razorpayUrl,
      method: rpMethod,
      headers: {
        Authorization:
          process.env.LOG_RAZORPAY_SECRET === "true"
            ? `Basic ${authFullBase64}`
            : `Basic ${authPreviewBase64}`,
        "Content-Type": "application/json",
      },
      body: JSON.parse(rpBody),
    });

    const order = await razorpay.orders.create(options);
    // Log the Razorpay order response for debugging
    try {
      console.log("[payment.create-order] order response:", order);
    } catch (logErr) {
      console.error("[payment.create-order] failed to log order response:", logErr);
    }

    res.status(200).json(order);
  } catch (error) {
    // Log full error for debugging (stack and object)
    console.error("[payment.create-order] error:", error);

    // Ensure we always return valid JSON to the client.
    const errorMessage =
      (error && (error.message || error.error || error.description)) ||
      String(error) ||
      "Internal Server Error";
    const errorCode = (error && error.code) || "INTERNAL_ERROR";

    // Include an error code in the JSON response to aid client-side handling.
    res.status(500).json({ error: errorMessage, code: errorCode });
  }
});

export default router;

