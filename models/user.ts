import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = model("User", userSchema);