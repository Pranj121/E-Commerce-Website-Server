import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Logged-in user info (from AuthContext / localStorage)
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Cart items
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        image: { type: String },
      },
    ],

    // Order summary
    totalAmount: {
      type: Number,
      required: true,
    },

    // Razorpay related fields
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

