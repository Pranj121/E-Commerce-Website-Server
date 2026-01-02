import Razorpay from "razorpay";

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpay;

if (!key_id || !key_secret) {
  throw new Error(
    "[razorpay config] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET. Set them in the environment."
  );
}

try {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
  const mode = key_id.startsWith("rzp_test_") ? "test" : "live";
  console.log(
    `[razorpay config] Razorpay initialized (${mode} mode). key_id=${maskKey(key_id)}`
  );
} catch (err) {
  console.error("[razorpay config] Failed to initialize Razorpay:", err);
  throw new Error("Razorpay initialization failed: " + (err && err.message ? err.message : String(err)));
}

export default razorpay;

