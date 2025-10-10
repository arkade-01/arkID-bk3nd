import { Router } from "express";
import { 
      createDiscount, 
      createMultipleDiscounts,
      getDiscounts, 
      checkDiscount, 
      deactivateDiscount 
} from "../controller/discountController";

const router = Router();

// Create a new discount code
router.post("/", createDiscount);

// Create multiple discount codes at once
router.post("/bulk", createMultipleDiscounts);

// Get all discount codes
router.get("/", getDiscounts);

// Validate a discount code
router.get("/validate/:code", checkDiscount);

// Deactivate a discount code
router.patch("/deactivate/:code", deactivateDiscount);

export default router;

