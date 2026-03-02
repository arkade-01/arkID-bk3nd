import { Router } from "express";
import {
      createDiscount,
      createMultipleDiscounts,
      getDiscounts,
      checkDiscount,
      deactivateDiscount
} from "../controller/discountController";

const router = Router();

router.post("/", createDiscount);
router.post("/bulk", createMultipleDiscounts);
router.get("/", getDiscounts);
router.get("/validate/:code", checkDiscount);
router.patch("/deactivate/:code", deactivateDiscount);

export default router;
