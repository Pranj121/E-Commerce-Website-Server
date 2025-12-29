import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ROUTES
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js"; // ✅ ADD THIS

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= MONGODB CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ================= BOOK SCHEMA ================= */
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
  category: String,
  image: String,
});

const Book = mongoose.model("Book", bookSchema);

/* ================= ROUTES ================= */

// Health check
app.get("/", (req, res) => {
  res.send("📚 BookBazaar API is running");
});

// Get all books
app.get("/api/products", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

/* ================= AUTH ROUTES ================= */
app.use("/api/auth", authRoutes);

/* ================= PAYMENT ROUTES ================= */
app.use("/api/payment", paymentRoutes); // ✅ ADD THIS

export default app;

