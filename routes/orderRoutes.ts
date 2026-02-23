import { Router } from "express";
import { createOrder } from "../controller/orderController";

const router = Router();

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: |
 *       Creates a new card order. Two flows depending on whether a discount code is provided:
 *       - **With discount code**: Order is created immediately at zero cost, card is provisioned, and confirmation emails are sent.
 *       - **Without discount code**: A Paystack transaction is initialized and a `paymentUrl` is returned for the user to complete payment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - phone
 *               - amount
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: john_doe
 *                 description: Desired username for the card
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               address:
 *                 type: string
 *                 example: 123 Main Street
 *               city:
 *                 type: string
 *                 example: Lagos
 *               state:
 *                 type: string
 *                 example: Lagos
 *               amount:
 *                 type: number
 *                 example: 10000
 *                 description: Amount in Naira (will be converted to kobo for Paystack)
 *               currency:
 *                 type: string
 *                 example: NGN
 *               discountCode:
 *                 type: string
 *                 example: SAVE2024
 *                 description: Optional discount code for a free order
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Order'
 *                     - type: object
 *                       properties:
 *                         order:
 *                           $ref: '#/components/schemas/Order'
 *                         reference:
 *                           type: string
 *                 paymentUrl:
 *                   type: string
 *                   description: Paystack checkout URL (only present when no discount code is used)
 *                   example: https://checkout.paystack.com/abc123
 *       400:
 *         description: Invalid request (missing username, invalid discount code, etc.)
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
router.post("/", createOrder);

export default router;
