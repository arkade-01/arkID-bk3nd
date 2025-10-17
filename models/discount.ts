import { Schema, model } from "mongoose";

const discountSchema = new Schema({
      code: { 
            type: String, 
            required: true, 
            uppercase: true,
            trim: true 
      },
      description: { 
            type: String, 
            required: false,
            default: "" 
      },
      isActive: { 
            type: Boolean, 
            required: true, 
            default: true 
      },
      usageLimit: { 
            type: Number, 
            required: false,
            default: null // null means unlimited
      },
      usedCount: { 
            type: Number, 
            required: true, 
            default: 0 
      },
      expiryDate: { 
            type: Date, 
            required: false,
            default: null 
      },
      createdAt: { 
            type: Date, 
            default: Date.now 
      },
      updatedAt: { 
            type: Date, 
            default: Date.now 
      }
});

// Add index for faster lookups
discountSchema.index({ code: 1 });

// Update the updatedAt timestamp before saving
discountSchema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
});

export const Discount = model("Discount", discountSchema);

