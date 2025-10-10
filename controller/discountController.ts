import { Request, Response } from "express";
import { 
      createDiscountCode, 
      createMultipleDiscountCodes,
      getAllDiscountCodes,
      deactivateDiscountCode,
      validateDiscountCode 
} from "../services/discountService";

/**
 * Create a new discount code
 */
export const createDiscount = async (req: Request, res: Response) => {
      try {
            const { code, description, usageLimit, expiryDate } = req.body;
            
            const discount = await createDiscountCode(
                  code,
                  description,
                  usageLimit,
                  expiryDate ? new Date(expiryDate) : undefined
            );
            
            return res.status(201).json({
                  success: true,
                  message: "Discount code created successfully",
                  data: discount
            });
      } catch (error) {
            console.error("Error creating discount:", error);
            return res.status(500).json({
                  success: false,
                  message: error instanceof Error ? error.message : "Failed to create discount code"
            });
      }
};

/**
 * Create multiple discount codes at once
 */
export const createMultipleDiscounts = async (req: Request, res: Response) => {
      try {
            const { count, description, usageLimit, expiryDate } = req.body;
            
            if (!count || count <= 0) {
                  return res.status(400).json({
                        success: false,
                        message: "Count must be greater than 0"
                  });
            }
            
            const result = await createMultipleDiscountCodes(
                  count,
                  description,
                  usageLimit,
                  expiryDate ? new Date(expiryDate) : undefined
            );
            
            return res.status(201).json({
                  success: true,
                  message: `Successfully created ${result.created} discount codes${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
                  data: result
            });
      } catch (error) {
            console.error("Error creating multiple discounts:", error);
            return res.status(500).json({
                  success: false,
                  message: error instanceof Error ? error.message : "Failed to create discount codes"
            });
      }
};

/**
 * Get all discount codes
 */
export const getDiscounts = async (req: Request, res: Response) => {
      try {
            const discounts = await getAllDiscountCodes();
            
            return res.status(200).json({
                  success: true,
                  data: discounts
            });
      } catch (error) {
            console.error("Error fetching discounts:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch discount codes"
            });
      }
};

/**
 * Validate a discount code
 */
export const checkDiscount = async (req: Request, res: Response) => {
      try {
            const { code } = req.params;
            
            if (!code) {
                  return res.status(400).json({
                        success: false,
                        message: "Discount code is required"
                  });
            }
            
            const validation = await validateDiscountCode(code);
            
            return res.status(validation.valid ? 200 : 400).json({
                  success: validation.valid,
                  message: validation.message,
                  data: validation.discount || null
            });
      } catch (error) {
            console.error("Error validating discount:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to validate discount code"
            });
      }
};

/**
 * Deactivate a discount code
 */
export const deactivateDiscount = async (req: Request, res: Response) => {
      try {
            const { code } = req.params;
            
            if (!code) {
                  return res.status(400).json({
                        success: false,
                        message: "Discount code is required"
                  });
            }
            
            const discount = await deactivateDiscountCode(code);
            
            if (!discount) {
                  return res.status(404).json({
                        success: false,
                        message: "Discount code not found"
                  });
            }
            
            return res.status(200).json({
                  success: true,
                  message: "Discount code deactivated successfully",
                  data: discount
            });
      } catch (error) {
            console.error("Error deactivating discount:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to deactivate discount code"
            });
      }
};

