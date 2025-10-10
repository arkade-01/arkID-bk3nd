import mongoose from "mongoose";
import { config } from "./config";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error instanceof Error ? error.message : error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying connection in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(retryCount + 1);
    } else {
      console.error("❌ Max retries reached. Could not connect to MongoDB.");
      console.error("⚠️ Server will continue running but database operations will fail.");
      console.error("💡 Please check your MongoDB connection and restart the server.");
      // Don't exit - let the server continue running
    }
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected - attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB Reconnected Successfully");
});

