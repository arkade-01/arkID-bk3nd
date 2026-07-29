/**
 * One-off backfill: populate Sales.cardId for orders provisioned before that
 * field existed. Joins Sales -> Card via the username embedded in cardLink
 * (the same derivation used at card-creation time).
 *
 * Usage:
 *   npx ts-node utils/backfillCardIds.ts --dry-run   (logs only, no writes)
 *   npx ts-node utils/backfillCardIds.ts             (applies the updates)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Sales } from "../models/sales";
import { Card } from "../models/card";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arkid";

const DRY_RUN = process.argv.includes("--dry-run");

async function backfillCardIds() {
      try {
            await mongoose.connect(MONGODB_URI);
            console.log(`✓ Connected to MongoDB${DRY_RUN ? " (dry run — no writes will be made)" : ""}`);

            const orders = await Sales.find({
                  provision_status: "provisioned",
                  $or: [{ cardId: { $exists: false } }, { cardId: "" }]
            });

            console.log(`Found ${orders.length} provisioned order(s) missing a cardId`);

            let updated = 0;
            let notFound = 0;
            let skipped = 0;

            for (const order of orders) {
                  const username = order.cardLink?.split("/").pop();

                  if (!username) {
                        console.warn(`⚠️ Order ${order.reference} has no parseable username in cardLink="${order.cardLink}"`);
                        skipped++;
                        continue;
                  }

                  const card = await Card.findOne({ username });

                  if (!card) {
                        console.warn(`✗ No card found for order ${order.reference} (username="${username}")`);
                        notFound++;
                        continue;
                  }

                  if (DRY_RUN) {
                        console.log(`[dry run] Order ${order.reference} -> would set cardId ${card.card_id}`);
                  } else {
                        order.cardId = card.card_id;
                        await order.save();
                        console.log(`✓ Order ${order.reference} -> cardId ${card.card_id}`);
                  }
                  updated++;
            }

            console.log(`\nDone. Updated: ${updated}, not found: ${notFound}, skipped: ${skipped}`);

            await mongoose.disconnect();
            console.log("✓ Disconnected from MongoDB");
      } catch (error) {
            console.error("✗ Error:", error);
            await mongoose.disconnect();
            process.exit(1);
      }
}

backfillCardIds();
