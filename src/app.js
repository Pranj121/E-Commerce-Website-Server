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

// Request / response logger for debugging
app.use((req, res, next) => {
  const start = Date.now();

  // when response finishes, log status and duration
  res.on("finish", () => {
    const duration = Date.now() - start;
    const now = new Date().toISOString();
    const bodyPreview =
      ["POST", "PUT", "PATCH"].includes(req.method) && req.body
        ? ` body=${JSON.stringify(req.body)}`
        : "";
    console.log(
      `[${now}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms${bodyPreview}`
    );
  });

  next();
});

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

// Centralized error handler to ensure valid JSON responses
app.use((err, req, res, next) => {
  console.error("[express error]", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

export default app;

