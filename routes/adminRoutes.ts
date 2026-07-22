import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { adminMiddleware } from "../middlewares/adminAuth";
import {
      listOrders,
      getOrder,
      reverifyPayment,
      retryProvision,
      retryEmail,
      resolveOrder,
      getMetrics,
} from "../controller/adminController";
import {
      createDiscount,
      createMultipleDiscounts,
      getDiscounts,
      deactivateDiscount,
} from "../controller/discountController";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/metrics", getMetrics);

router.get("/orders", listOrders);
router.get("/orders/:reference", getOrder);
router.post("/orders/:reference/verify-payment", reverifyPayment);
router.post("/orders/:reference/retry-provision", retryProvision);
router.post("/orders/:reference/retry-email", retryEmail);
router.patch("/orders/:reference/resolve", resolveOrder);

router.get("/discounts", getDiscounts);
router.post("/discounts", createDiscount);
router.post("/discounts/bulk", createMultipleDiscounts);
router.patch("/discounts/:code/deactivate", deactivateDiscount);

export default router;
