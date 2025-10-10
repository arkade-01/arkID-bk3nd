import { Router } from "express";
import orderRoutes from "./orderRoutes";
import paymentRoutes from "./paymentRoutes";
import discountRoutes from "./discountRoutes";

const router = Router();

router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/discounts", discountRoutes);

export default router;