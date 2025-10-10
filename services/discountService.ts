import { Discount } from "../models/discount";

/**
 * Generate a random discount code
 */
export const generateDiscountCode = (length: number = 8): string => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
};

/**
 * Create a new unique discount code
 */
export const createDiscountCode = async (
      code?: string,
      description?: string,
      usageLimit?: number,
      expiryDate?: Date
) => {
      try {
            // If no code provided, generate one
            let discountCode = code ? code.toUpperCase().trim() : generateDiscountCode();
            
            // Check if code already exists
            let existingCode = await Discount.findOne({ code: discountCode });
            
            // If auto-generating and code exists, keep generating until unique
            if (!code && existingCode) {
                  let attempts = 0;
                  while (existingCode && attempts < 10) {
                        discountCode = generateDiscountCode();
                        existingCode = await Discount.findOne({ code: discountCode });
                        attempts++;
                  }
                  
                  if (existingCode) {
                        throw new Error("Failed to generate unique code after 10 attempts");
                  }
            } else if (code && existingCode) {
                  throw new Error("Discount code already exists");
            }
            
            const discount = await Discount.create({
                  code: discountCode,
                  description: description || "",
                  usageLimit: usageLimit || null,
                  expiryDate: expiryDate || null,
                  isActive: true,
                  usedCount: 0
            });
            
            return discount;
      } catch (error) {
            console.error("Error creating discount code:", error);
            throw error;
      }
};

/**
 * Create multiple unique discount codes at once
 */
export const createMultipleDiscountCodes = async (
      count: number,
      description?: string,
      usageLimit?: number,
      expiryDate?: Date
) => {
      try {
            if (count <= 0) {
                  throw new Error("Count must be greater than 0");
            }
            
            if (count > 1000) {
                  throw new Error("Cannot generate more than 1000 codes at once");
            }
            
            const createdCodes = [];
            const failedCodes = [];
            
            for (let i = 0; i < count; i++) {
                  try {
                        // Generate unique code
                        let discountCode = generateDiscountCode();
                        let existingCode = await Discount.findOne({ code: discountCode });
                        
                        // Keep trying until we get a unique code
                        let attempts = 0;
                        while (existingCode && attempts < 20) {
                              discountCode = generateDiscountCode();
                              existingCode = await Discount.findOne({ code: discountCode });
                              attempts++;
                        }
                        
                        if (existingCode) {
                              failedCodes.push({ 
                                    index: i + 1, 
                                    error: "Failed to generate unique code" 
                              });
                              continue;
                        }
                        
                        // Create the discount code
                        const discount = await Discount.create({
                              code: discountCode,
                              description: description || "",
                              usageLimit: usageLimit || null,
                              expiryDate: expiryDate || null,
                              isActive: true,
                              usedCount: 0
                        });
                        
                        createdCodes.push(discount);
                  } catch (error) {
                        failedCodes.push({ 
                              index: i + 1, 
                              error: error instanceof Error ? error.message : "Unknown error" 
                        });
                  }
            }
            
            return {
                  success: true,
                  created: createdCodes.length,
                  failed: failedCodes.length,
                  codes: createdCodes,
                  errors: failedCodes
            };
      } catch (error) {
            console.error("Error creating multiple discount codes:", error);
            throw error;
      }
};

/**
 * Validate a discount code
 */
export const validateDiscountCode = async (code: string) => {
      try {
            const discount = await Discount.findOne({ 
                  code: code.toUpperCase().trim() 
            });
            
            if (!discount) {
                  return {
                        valid: false,
                        message: "Discount code not found"
                  };
            }
            
            if (!discount.isActive) {
                  return {
                        valid: false,
                        message: "Discount code is inactive"
                  };
            }
            
            if (discount.expiryDate && new Date() > discount.expiryDate) {
                  return {
                        valid: false,
                        message: "Discount code has expired"
                  };
            }
            
            if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
                  return {
                        valid: false,
                        message: "Discount code usage limit reached"
                  };
            }
            
            return {
                  valid: true,
                  message: "Discount code is valid",
                  discount
            };
      } catch (error) {
            console.error("Error validating discount code:", error);
            throw error;
      }
};

/**
 * Increment the usage count of a discount code
 */
export const incrementDiscountUsage = async (code: string) => {
      try {
            const discount = await Discount.findOneAndUpdate(
                  { code: code.toUpperCase().trim() },
                  { $inc: { usedCount: 1 } },
                  { new: true }
            );
            
            return discount;
      } catch (error) {
            console.error("Error incrementing discount usage:", error);
            throw error;
      }
};

/**
 * Get all discount codes
 */
export const getAllDiscountCodes = async () => {
      try {
            const discounts = await Discount.find().sort({ createdAt: -1 });
            return discounts;
      } catch (error) {
            console.error("Error fetching discount codes:", error);
            throw error;
      }
};

/**
 * Deactivate a discount code
 */
export const deactivateDiscountCode = async (code: string) => {
      try {
            const discount = await Discount.findOneAndUpdate(
                  { code: code.toUpperCase().trim() },
                  { isActive: false },
                  { new: true }
            );
            
            return discount;
      } catch (error) {
            console.error("Error deactivating discount code:", error);
            throw error;
      }
};

