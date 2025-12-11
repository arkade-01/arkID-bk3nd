import dotenv from 'dotenv';

dotenv.config();

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
      PORT: process.env.PORT || 3000,
      SECRET: process.env.PAYSTACK_SECRET || "",
      URL: process.env.PAYSTACK_URL || "https://api.paystack.co",
      // CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/api/payments/callback",
      
      // Environment-based frontend URL configuration
      NODE_ENV: process.env.NODE_ENV || 'development',
      IS_DEVELOPMENT: isDevelopment,
      IS_PRODUCTION: isProduction,
      
      // Frontend URLs based on environment
      FRONTEND_URL: process.env.FRONTEND_URL || (isDevelopment ? "http://localhost:5173" : "https://www.ark-id.xyz"),
      FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV || "http://localhost:5173",
      FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD || "https://www.ark-id.xyz",
      
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/arkid",
      
      // CORS configuration - comma-separated list of allowed origins
      CORS_ORIGINS: process.env.CORS_ORIGINS 
            ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
            : [],
      EMAIL: {
            SERVICE: process.env.EMAIL_SERVICE || "gmail",
            USER: process.env.EMAIL_USER || "",
            PASS: process.env.EMAIL_PASS || "",
            FROM: process.env.EMAIL_FROM || "",
            SUBJECT_PREFIX: process.env.EMAIL_SUBJECT_PREFIX || "[arkID] ",
            SELLER_EMAIL: process.env.SELLER_EMAIL || "admin@arkid.com"
      },
      PRIVY_APP_ID: process.env.PRIVY_APP_ID || "",
      PRIVY_SECRET: process.env.PRIVY_SECRET || ""
}