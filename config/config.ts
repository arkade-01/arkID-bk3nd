import dotenv from 'dotenv';

dotenv.config();

export const config = {
      PORT: process.env.PORT || 3000,
      SECRET: process.env.PAYSTACK_SECRET || "",
      URL: process.env.PAYSTACK_URL || "https://api.paystack.co",
      CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/api/payments/callback",
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3001",
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/arkid",
      EMAIL: {
            SERVICE: process.env.EMAIL_SERVICE || "gmail",
            USER: process.env.EMAIL_USER || "",
            PASS: process.env.EMAIL_PASS || "",
            FROM: process.env.EMAIL_FROM || "",
            SUBJECT_PREFIX: process.env.EMAIL_SUBJECT_PREFIX || "[arkID] ",
            SELLER_EMAIL: process.env.SELLER_EMAIL || "admin@arkid.com"
      }
}