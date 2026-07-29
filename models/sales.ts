import { Schema, model } from "mongoose";

const salesSchema = new Schema({
      amount: { type: Number, required: true },
      email: { type: String, required: false, default: "" },
      transactionId: { type: String, required: true },
      reference: { type: String, required: true },
      currency: { type: String, required: true },
      discount: { type: String, required: false, default: "" },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      cardLink: { type: String, required: true },
      cardId: { type: String, default: "" },

      // Legacy overall status, derived from payment_status. Kept for backward
      // compatibility with existing consumers (frontend types, redirects).
      status: { type: String, required: true },

      // Explicit sub-states: payment, provisioning (card creation) and email
      // notification fail independently of one another, so each gets its own state.
      payment_status: {
            type: String,
            enum: ["pending", "verified", "failed"],
            default: "pending",
      },
      provision_status: {
            type: String,
            enum: ["pending", "provisioned", "failed"],
            default: "pending",
      },
      email_status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
      },
      last_error: { type: String, default: "" },
      attempts: { type: Number, default: 0 },
      updated_at: { type: Date, default: Date.now },

      createdAt: { type: Date, default: Date.now },
});

salesSchema.index({ payment_status: 1 });
salesSchema.index({ provision_status: 1 });
salesSchema.index({ email_status: 1 });

export const Sales = model("Sales", salesSchema);