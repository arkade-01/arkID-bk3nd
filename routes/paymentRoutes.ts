import { Router } from "express";
import { 
      handlePaymentCallback, 
      handlePaymentWebhook,
      verifyPayment,
      getOrderStatus
} from "../controller/paymentController";

const router = Router();

// Payment callback (user is redirected here after payment)
router.get("/callback", handlePaymentCallback);

// Paystack webhook (called by Paystack servers)
router.post("/webhook", handlePaymentWebhook);

// Manually verify a payment
router.get("/verify/:reference", verifyPayment);

// Get order status by reference
router.get("/status/:reference", getOrderStatus);

export default router;

