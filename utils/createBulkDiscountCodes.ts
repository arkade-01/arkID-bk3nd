/**
 * Utility script to create multiple discount codes in bulk
 * 
 * Usage:
 * 1. Set up your MongoDB connection in .env
 * 2. Run: npx ts-node utils/createBulkDiscountCodes.ts
 */

import mongoose from "mongoose";
import { createMultipleDiscountCodes } from "../services/discountService";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arkid";

async function createBulkCodes() {
      try {
            // Connect to MongoDB
            await mongoose.connect(MONGODB_URI);
            console.log("✓ Connected to MongoDB");

            // Example 1: Create 10 codes with 100 uses each, valid for 30 days
            console.log("\n📦 Creating 10 discount codes...");
            const result1 = await createMultipleDiscountCodes(
                  10,                 // Create 10 codes
                  "Promotional codes - Batch 1", // Description
                  100,                // 100 uses per code
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
            );
            
            console.log(`✓ Successfully created ${result1.created} codes`);
            if (result1.failed > 0) {
                  console.log(`✗ Failed to create ${result1.failed} codes`);
            }
            
            // Print all generated codes
            console.log("\n🎫 Generated Codes:");
            result1.codes.forEach((code, index) => {
                  console.log(`  ${index + 1}. ${code.code}`);
            });

            // Example 2: Create 5 unlimited use codes
            console.log("\n📦 Creating 5 unlimited use codes...");
            const result2 = await createMultipleDiscountCodes(
                  5,                  // Create 5 codes
                  "VIP unlimited codes", // Description
                  undefined,          // No usage limit
                  undefined           // No expiry
            );
            
            console.log(`✓ Successfully created ${result2.created} codes`);
            
            console.log("\n🎫 Generated VIP Codes:");
            result2.codes.forEach((code, index) => {
                  console.log(`  ${index + 1}. ${code.code}`);
            });

            // Summary
            const totalCreated = result1.created + result2.created;
            const totalFailed = result1.failed + result2.failed;
            
            console.log("\n" + "=".repeat(50));
            console.log("📊 SUMMARY");
            console.log("=".repeat(50));
            console.log(`✓ Total codes created: ${totalCreated}`);
            if (totalFailed > 0) {
                  console.log(`✗ Total failed: ${totalFailed}`);
            }
            console.log("=".repeat(50));
            
            await mongoose.disconnect();
            console.log("\n✓ Disconnected from MongoDB");
            
      } catch (error) {
            console.error("\n✗ Error:", error);
            await mongoose.disconnect();
            process.exit(1);
      }
}

// Run the script
createBulkCodes();

