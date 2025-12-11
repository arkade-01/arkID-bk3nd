import { Schema, model } from "mongoose";

const cardSchema = new Schema({
  // Card identification
  card_id: {
    type: String,
    required: true,
    unique: true
  },

  // User data
  user_id: {
    type: String,
    unique: true  // Your custom generated base64 ID
  },
  privy_id: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple null values, set on activation
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false
  },
  wallet: {
    type: String,
    required: false
  },

  // Card state
  isActivated: {
    type: Boolean,
    default: false
  },
  redirect_url: {
    type: String,
    required: false
  },

  // Analytics
  taps_count: {
    type: Number,
    default: 0
  },
  valid_redirects_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save hook to generate user_id when card is activated
cardSchema.pre('save', function(next) {
  // Only generate user_id if card is being activated and user_id doesn't exist
  if (this.isActivated && !this.user_id) {
    // Generate base64 ID from card_id + timestamp
    const data = `${this.card_id}-${Date.now()}`;
    this.user_id = Buffer.from(data).toString('base64').substring(0, 16);
  }
  next();
});

// Index for faster queries
cardSchema.index({ username: 1 });
cardSchema.index({ user_id: 1 });
cardSchema.index({ privy_id: 1 });

export const Card = model("Card", cardSchema);