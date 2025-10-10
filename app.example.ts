/**
 * Example Express App Setup
 * This shows how to wire up all the routes
 */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import discountRoutes from "./routes/discountRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arkid";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (add if needed)
// app.use(cors());

// Routes
app.use("/api/discounts", discountRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
      res.json({ status: "OK", message: "arkID Backend is running" });
});

// Connect to MongoDB and start server
mongoose
      .connect(MONGODB_URI)
      .then(() => {
            console.log("✓ Connected to MongoDB");
            app.listen(PORT, () => {
                  console.log(`✓ Server running on port ${PORT}`);
                  console.log(`✓ Health check: http://localhost:${PORT}/health`);
                  console.log(`✓ Discount API: http://localhost:${PORT}/api/discounts`);
                  console.log(`✓ Order API: http://localhost:${PORT}/api/orders`);
                  console.log(`✓ Payment API: http://localhost:${PORT}/api/payments`);
            });
      })
      .catch((error) => {
            console.error("✗ MongoDB connection error:", error);
            process.exit(1);
      });

export default app;

