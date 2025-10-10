/**
 * Utility script to create discount codes
 * 
 * Usage:
 * 1. Set up your MongoDB connection
 * 2. Run: npx ts-node utils/createDiscountCode.ts
 */

import mongoose from "mongoose";
import { createDiscountCode } from "../services/discountService";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arkid";

async function createDiscount() {
      try {
            // Connect to MongoDB
            await mongoose.connect(MONGODB_URI);
            console.log("✓ Connected to MongoDB");

            // Example 1: Create a discount code with a custom code
            const discount1 = await createDiscountCode(
                  "WELCOME2024",      // Custom code
                  "Welcome discount for new users", // Description
                  100,                // Usage limit (100 uses)
                  undefined           // No expiry date
            );
            console.log("✓ Created discount code:", discount1.code);

            // Example 2: Create a discount code with auto-generated code
            const discount2 = await createDiscountCode(
                  undefined,          // Auto-generate code
                  "Limited time offer", // Description
                  50,                 // Usage limit (50 uses)
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
            );
            console.log("✓ Created discount code:", discount2.code);

            // Example 3: Create unlimited use discount code
            const discount3 = await createDiscountCode(
                  "FREESHIP",         // Custom code
                  "Free shipping", // Description
                  undefined,          // No usage limit
                  undefined           // No expiry date
            );
            console.log("✓ Created discount code:", discount3.code);

            console.log("\n✓ All discount codes created successfully!");
            
            await mongoose.disconnect();
            console.log("✓ Disconnected from MongoDB");
            
      } catch (error) {
            console.error("✗ Error:", error);
            await mongoose.disconnect();
            process.exit(1);
      }
}

// Run the script
createDiscount();

