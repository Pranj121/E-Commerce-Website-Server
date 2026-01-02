

import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Process-level error handlers for better visibility
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception - shutting down:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

console.log("Environment:", process.env.NODE_ENV || "development");
console.log("MONGO_URI present:", !!process.env.MONGO_URI);
const maskedRzpId = process.env.RAZORPAY_KEY_ID
  ? maskKey(process.env.RAZORPAY_KEY_ID)
  : null;
console.log("RAZORPAY Key ID:", maskedRzpId || "MISSING");
console.log("RAZORPAY Key Secret present:", !!process.env.RAZORPAY_KEY_SECRET);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

