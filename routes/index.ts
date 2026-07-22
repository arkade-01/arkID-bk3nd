import { Router } from "express";
import orderRoutes from "./orderRoutes";
import paymentRoutes from "./paymentRoutes";
import discountRoutes from "./discountRoutes";
import cardRoutes from "./cardRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/discounts", discountRoutes);
router.use("/card", cardRoutes);
router.use("/admin", adminRoutes);

export default router;