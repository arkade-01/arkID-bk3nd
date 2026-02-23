import { Router } from "express";
import {
      createDiscount,
      createMultipleDiscounts,
      getDiscounts,
      checkDiscount,
      deactivateDiscount
} from "../controller/discountController";

const router = Router();

/**
 * @openapi
 * /discounts:
 *   post:
 *     tags:
 *       - Discounts
 *     summary: Create a single discount code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: LAUNCH2024
 *                 description: The discount code (will be uppercased)
 *               description:
 *                 type: string
 *                 example: Special launch offer
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *                 example: 100
 *                 description: Max number of uses (null for unlimited)
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Discount code created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createDiscount);

/**
 * @openapi
 * /discounts/bulk:
 *   post:
 *     tags:
 *       - Discounts
 *     summary: Create multiple discount codes at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - count
 *             properties:
 *               count:
 *                 type: integer
 *                 example: 50
 *                 description: Number of codes to generate
 *               description:
 *                 type: string
 *                 example: Bulk promo batch
 *               usageLimit:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Discount codes created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     codes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Discount'
 *       400:
 *         description: count must be greater than 0
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/bulk", createMultipleDiscounts);

/**
 * @openapi
 * /discounts:
 *   get:
 *     tags:
 *       - Discounts
 *     summary: Get all discount codes
 *     responses:
 *       200:
 *         description: List of all discount codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Discount'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getDiscounts);

/**
 * @openapi
 * /discounts/validate/{code}:
 *   get:
 *     tags:
 *       - Discounts
 *     summary: Validate a discount code
 *     description: Checks whether a discount code is active, not expired, and within its usage limit.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The discount code to validate
 *         example: LAUNCH2024
 *     responses:
 *       200:
 *         description: Discount code is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *       400:
 *         description: Discount code is invalid, expired, or exhausted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/validate/:code", checkDiscount);

/**
 * @openapi
 * /discounts/deactivate/{code}:
 *   patch:
 *     tags:
 *       - Discounts
 *     summary: Deactivate a discount code
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The discount code to deactivate
 *         example: LAUNCH2024
 *     responses:
 *       200:
 *         description: Discount code deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *       400:
 *         description: Missing code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/deactivate/:code", deactivateDiscount);

export default router;
