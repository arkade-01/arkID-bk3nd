import { Router } from "express";
import {
      handlePaymentCallback,
      handlePaymentWebhook,
      verifyPayment,
      getOrderStatus
} from "../controller/paymentController";

const router = Router();

router.get("/callback", handlePaymentCallback);
router.post("/webhook", handlePaymentWebhook);
router.get("/verify/:reference", verifyPayment);
router.get("/status/:reference", getOrderStatus);

export default router;
