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
      status: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
});

export const Sales = model("Sales", salesSchema);