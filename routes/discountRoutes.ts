import { Router } from "express";
import { checkDiscount } from "../controller/discountController";

const router = Router();

// Public: used by the checkout flow to validate a code before purchase.
// Management endpoints (create/list/deactivate) live under /admin/discounts.
router.get("/validate/:code", checkDiscount);

export default router;
