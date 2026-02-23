import { Router } from "express";
import {
      handlePaymentCallback,
      handlePaymentWebhook,
      verifyPayment,
      getOrderStatus
} from "../controller/paymentController";

const router = Router();

/**
 * @openapi
 * /payments/callback:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Paystack payment callback
 *     description: |
 *       Redirect endpoint called by Paystack after the user completes or cancels payment.
 *       Verifies the transaction, updates the order, creates the card, sends confirmation emails,
 *       and redirects the user to the frontend success or failure page.
 *       **This endpoint is called by Paystack, not directly by clients.**
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         description: Transaction reference from Paystack
 *       - in: query
 *         name: trxref
 *         schema:
 *           type: string
 *         description: Alternate transaction reference field from Paystack
 *     responses:
 *       302:
 *         description: Redirect to frontend success or failure page
 *       500:
 *         description: Server error – redirects to frontend error page
 */
router.get("/callback", handlePaymentCallback);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Paystack webhook
 *     description: |
 *       Receives payment event notifications from Paystack servers.
 *       Validates the HMAC-SHA512 signature in the `x-paystack-signature` header.
 *       Handles `charge.success` and `charge.failed` events.
 *       **This endpoint is called by Paystack, not directly by clients.**
 *     parameters:
 *       - in: header
 *         name: x-paystack-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC-SHA512 signature for webhook verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: charge.success
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook received and processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook processing failed
 */
router.post("/webhook", handlePaymentWebhook);

/**
 * @openapi
 * /payments/verify/{reference}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Manually verify a payment
 *     description: Verifies a transaction with Paystack and updates the order status in the database. Useful for polling from the frontend after payment.
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *         example: ORD_1700000000000_abc123xyz
 *     responses:
 *       200:
 *         description: Payment verified successfully
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
 *                     paymentStatus:
 *                       type: string
 *                       example: success
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Missing reference or payment not successful
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
router.get("/verify/:reference", verifyPayment);

/**
 * @openapi
 * /payments/status/{reference}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get order status by reference
 *     description: Returns the current status of an order. If the order is still pending, it checks Paystack for updates and syncs the status.
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Order reference
 *         example: ORD_1700000000000_abc123xyz
 *     responses:
 *       200:
 *         description: Order status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing reference
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
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
router.get("/status/:reference", getOrderStatus);

export default router;
