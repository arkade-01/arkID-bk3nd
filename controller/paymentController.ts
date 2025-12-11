import { Request, Response } from "express";
import { verifyTransaction } from "../services/paystackService";
import { Sales } from "../models/sales";
import { config } from "../config/config";
import { sendPaymentSuccessEmail, sendOrderReceivedEmail } from "../services/emailService";
import { createCardForUser } from "../controllers/cardController";
import crypto from "crypto";

/**
 * Handle Paystack callback after payment
 * This is where users are redirected after payment
 */
export const handlePaymentCallback = async (req: Request, res: Response) => {
      try {
            const { reference, trxref } = req.query;
            const transactionReference = (reference || trxref) as string;

            if (!transactionReference) {
                  const redirectUrl = config.IS_DEVELOPMENT ? config.FRONTEND_URL_DEV : config.FRONTEND_URL_PROD;
                  return res.redirect(
                        `${redirectUrl}/payment/error?message=No reference provided`
                  );
            }

            // Verify the transaction with Paystack
            const verification = await verifyTransaction(transactionReference);

            if (verification.data.status === "success") {
                  // Update order status in database
                  const order = await Sales.findOneAndUpdate(
                        { reference: transactionReference },
                        { 
                              status: "completed",
                              transactionId: verification.data.reference
                        },
                        { new: true }
                  );

                  if (!order) {
                        const redirectUrl = config.IS_DEVELOPMENT ? config.FRONTEND_URL_DEV : config.FRONTEND_URL_PROD;
                        return res.redirect(
                              `${redirectUrl}/payment/error?message=Order not found`
                        );
                  }

                  // Create card for user after successful payment
                  try {
                        // Extract username from cardLink (e.g., "https://ark-id.com/john_doe" -> "john_doe")
                        const username = order.cardLink.split('/').pop() || `user_${Date.now()}`;

                        await createCardForUser(username, order.email || "");
                        console.log(`✅ Card created for username: ${username}`);
                  } catch (cardError) {
                        console.error("⚠️ Card creation failed:", cardError);
                        // Don't fail the payment callback if card creation fails
                        // You might want to handle this separately
                  }

                  // Send emails to buyer and seller
                  try {
                        const orderDetails = {
                              name: order.name,
                              email: order.email || "",
                              phone: order.phone,
                              address: order.address,
                              city: order.city,
                              state: order.state,
                              cardLink: order.cardLink,
                              reference: order.reference,
                              amount: order.amount,
                              currency: order.currency,
                              discount: order.discount || ""
                        };

                        // Send confirmation to buyer (only if email exists)
                        if (order.email) {
                              await sendPaymentSuccessEmail(order.email, orderDetails);
                        }
                        
                        // Notify seller/admin
                        await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);
                        
                        console.log(`✅ Emails sent for order ${order.reference}`);
                  } catch (emailError) {
                        console.error("⚠️ Email sending failed:", emailError);
                        // Don't fail the callback if email fails
                  }

                  // Redirect to success page
                  const redirectUrl = config.IS_DEVELOPMENT ? config.FRONTEND_URL_DEV : config.FRONTEND_URL_PROD;
                  return res.redirect(
                        `${redirectUrl}/payment/success?reference=${transactionReference}&order=${order._id}`
                  );
            } else {
                  // Payment failed or was cancelled
                  await Sales.findOneAndUpdate(
                        { reference: transactionReference },
                        { status: "failed" }
                  );

                  const redirectUrl = config.IS_DEVELOPMENT ? config.FRONTEND_URL_DEV : config.FRONTEND_URL_PROD;
                  return res.redirect(
                        `${redirectUrl}/payment/failed?reference=${transactionReference}`
                  );
            }
      } catch (error) {
            console.error("Error handling payment callback:", error);
            const redirectUrl = config.IS_DEVELOPMENT ? config.FRONTEND_URL_DEV : config.FRONTEND_URL_PROD;
            return res.redirect(
                  `${redirectUrl}/payment/error?message=${error instanceof Error ? error.message : 'Unknown error'}`
            );
      }
};

/**
 * Handle Paystack webhook
 * This is called by Paystack servers when payment status changes
 */
export const handlePaymentWebhook = async (req: Request, res: Response) => {
      try {
            // Validate webhook signature
            const hash = crypto
                  .createHmac("sha512", config.SECRET)
                  .update(JSON.stringify(req.body))
                  .digest("hex");

            if (hash !== req.headers["x-paystack-signature"]) {
                  console.error("Invalid webhook signature");
                  return res.status(401).json({ error: "Invalid signature" });
            }

            const event = req.body;

            // Handle different event types
            switch (event.event) {
                  case "charge.success":
                        await handleSuccessfulCharge(event.data);
                        break;
                  case "charge.failed":
                        await handleFailedCharge(event.data);
                        break;
                  default:
                        console.log(`Unhandled event type: ${event.event}`);
            }

            // Acknowledge receipt of webhook
            return res.status(200).json({ received: true });
      } catch (error) {
            console.error("Error handling webhook:", error);
            return res.status(500).json({ error: "Webhook processing failed" });
      }
};

/**
 * Verify payment status manually
 * Useful for checking payment status from frontend
 */
export const verifyPayment = async (req: Request, res: Response) => {
      try {
            const { reference } = req.params;

            if (!reference) {
                  return res.status(400).json({
                        success: false,
                        message: "Reference is required"
                  });
            }

            // Verify with Paystack
            const verification = await verifyTransaction(reference);

            // Update order status
            if (verification.data.status === "success") {
                  const order = await Sales.findOneAndUpdate(
                        { reference },
                        { 
                              status: "completed",
                              transactionId: verification.data.reference
                        },
                        { new: true }
                  );

                  return res.status(200).json({
                        success: true,
                        message: "Payment verified successfully",
                        data: {
                              paymentStatus: verification.data.status,
                              order
                        }
                  });
            } else {
                  await Sales.findOneAndUpdate(
                        { reference },
                        { status: "failed" }
                  );

                  return res.status(400).json({
                        success: false,
                        message: "Payment verification failed",
                        data: {
                              paymentStatus: verification.data.status
                        }
                  });
            }
      } catch (error) {
            console.error("Error verifying payment:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to verify payment"
            });
      }
};

/**
 * Get order status by reference
 * Also checks with Paystack if order is still pending
 */
export const getOrderStatus = async (req: Request, res: Response) => {
      try {
            const { reference } = req.params;

            if (!reference) {
                  return res.status(400).json({
                        success: false,
                        message: "Reference is required"
                  });
            }

            const order = await Sales.findOne({ reference });

            if (!order) {
                  return res.status(404).json({
                        success: false,
                        message: "Order not found"
                  });
            }

            // If order is still pending, check with Paystack for updates
            if (order.status === "pending") {
                  try {
                        const verification = await verifyTransaction(reference);
                        
                        if (verification.data.status === "success") {
                              // Update to completed
                              order.status = "completed";
                              order.transactionId = verification.data.reference;
                              await order.save();
                        } else if (verification.data.status === "failed") {
                              // Update to failed
                              order.status = "failed";
                              await order.save();
                        }
                        // If still pending on Paystack, leave as pending
                  } catch (error) {
                        // If verification fails, payment likely abandoned
                        console.log("Payment verification failed for pending order:", reference);
                  }
            }

            return res.status(200).json({
                  success: true,
                  data: {
                        reference: order.reference,
                        status: order.status,
                        amount: order.amount,
                        currency: order.currency,
                        createdAt: order.createdAt
                  }
            });
      } catch (error) {
            console.error("Error getting order status:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to get order status"
            });
      }
};

// Helper functions
async function handleSuccessfulCharge(data: any) {
      try {
            const reference = data.reference;

            const order = await Sales.findOneAndUpdate(
                  { reference },
                  {
                        status: "completed",
                        transactionId: data.id || reference
                  },
                  { new: true }
            );

            // Create card for user after successful payment (webhook)
            if (order) {
                  try {
                        const username = order.cardLink.split('/').pop() || `user_${Date.now()}`;
                        await createCardForUser(username, order.email || "");
                        console.log(`✅ Card created via webhook for username: ${username}`);
                  } catch (cardError) {
                        console.error("⚠️ Card creation failed in webhook:", cardError);
                  }
            }

            console.log(`Payment successful for reference: ${reference}`);
      } catch (error) {
            console.error("Error handling successful charge:", error);
      }
}

async function handleFailedCharge(data: any) {
      try {
            const reference = data.reference;
            
            await Sales.findOneAndUpdate(
                  { reference },
                  { status: "failed" }
            );

            console.log(`Payment failed for reference: ${reference}`);
      } catch (error) {
            console.error("Error handling failed charge:", error);
      }
}

