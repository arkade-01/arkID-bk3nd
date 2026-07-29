import { Request, Response } from "express";
import { Sales } from "../models/sales";
import { verifyTransaction } from "../services/paystackService";
import { createCardForUser } from "../controllers/cardController";
import {
      sendPaymentSuccessEmail,
      sendDiscountAppliedEmail,
      sendOrderReceivedEmail,
} from "../services/emailService";
import {
      setPaymentStatus,
      setProvisionStatus,
      setEmailStatus,
      PaymentStatus,
      ProvisionStatus,
      EmailStatus,
} from "../services/orderStatusService";
import { config } from "../config/config";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "verified", "failed"];
const PROVISION_STATUSES: ProvisionStatus[] = ["pending", "provisioned", "failed"];
const EMAIL_STATUSES: EmailStatus[] = ["pending", "sent", "failed"];

/**
 * List orders with optional filtering by sub-state and pagination.
 * e.g. GET /admin/orders?provision_status=failed
 */
export const listOrders = async (req: Request, res: Response) => {
      try {
            const { payment_status, provision_status, email_status, reference, email } = req.query;
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);

            const filter: Record<string, any> = {};
            if (payment_status) filter.payment_status = payment_status;
            if (provision_status) filter.provision_status = provision_status;
            if (email_status) filter.email_status = email_status;
            if (reference) filter.reference = { $regex: reference as string, $options: "i" };
            if (email) filter.email = { $regex: email as string, $options: "i" };

            const [orders, total] = await Promise.all([
                  Sales.find(filter)
                        .sort({ updated_at: -1 })
                        .skip((page - 1) * limit)
                        .limit(limit),
                  Sales.countDocuments(filter),
            ]);

            return res.status(200).json({
                  success: true,
                  data: orders,
                  pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                  },
            });
      } catch (error) {
            console.error("Error listing orders:", error);
            return res.status(500).json({ success: false, message: "Failed to list orders" });
      }
};

/**
 * Get a single order by reference, including its sub-states.
 */
export const getOrder = async (req: Request, res: Response) => {
      try {
            const reference = req.params.reference as string;
            const order = await Sales.findOne({ reference });

            if (!order) {
                  return res.status(404).json({ success: false, message: "Order not found" });
            }

            return res.status(200).json({ success: true, data: order });
      } catch (error) {
            console.error("Error getting order:", error);
            return res.status(500).json({ success: false, message: "Failed to get order" });
      }
};

/**
 * Re-check a payment with Paystack and update payment_status accordingly.
 * Useful when a webhook was missed or an order looks stuck.
 */
export const reverifyPayment = async (req: Request, res: Response) => {
      try {
            const reference = req.params.reference as string;
            const order = await Sales.findOne({ reference });

            if (!order) {
                  return res.status(404).json({ success: false, message: "Order not found" });
            }

            if (order.transactionId === "DISCOUNT_APPLIED") {
                  return res.status(400).json({
                        success: false,
                        message: "This order used a discount code and has no gateway transaction to verify",
                  });
            }

            try {
                  const verification = await verifyTransaction(reference);
                  const paymentStatus: PaymentStatus =
                        verification.data.status === "success" ? "verified" : "failed";

                  const updated = await setPaymentStatus(reference, paymentStatus, {
                        transactionId:
                              paymentStatus === "verified" ? verification.data.reference : undefined,
                        error:
                              paymentStatus === "failed"
                                    ? `Gateway status: ${verification.data.status}`
                                    : undefined,
                  });

                  return res.status(200).json({
                        success: true,
                        message: `Payment re-verified as ${paymentStatus}`,
                        data: { order: updated, gatewayStatus: verification.data.status },
                  });
            } catch (verifyError) {
                  return res.status(502).json({
                        success: false,
                        message: "Failed to reach payment gateway for verification",
                  });
            }
      } catch (error) {
            console.error("Error reverifying payment:", error);
            return res.status(500).json({ success: false, message: "Failed to reverify payment" });
      }
};

/**
 * Retry card provisioning for an order whose payment is verified
 * but whose card creation previously failed (e.g. username collision).
 */
export const retryProvision = async (req: Request, res: Response) => {
      try {
            const reference = req.params.reference as string;
            const order = await Sales.findOne({ reference });

            if (!order) {
                  return res.status(404).json({ success: false, message: "Order not found" });
            }

            if (order.payment_status !== "verified") {
                  return res.status(400).json({
                        success: false,
                        message: "Cannot provision a card until payment is verified",
                  });
            }

            if (order.provision_status === "provisioned") {
                  return res.status(400).json({ success: false, message: "Order is already provisioned" });
            }

            try {
                  const username = order.cardLink.split("/").pop() || `user_${Date.now()}`;
                  const card = await createCardForUser(username, order.email || "");
                  const updated = await setProvisionStatus(reference, "provisioned", undefined, card.card_id);

                  return res.status(200).json({
                        success: true,
                        message: "Card provisioned successfully",
                        data: { order: updated, card_id: card.card_id },
                  });
            } catch (provisionError) {
                  const message =
                        provisionError instanceof Error ? provisionError.message : "Provisioning failed";
                  const updated = await setProvisionStatus(reference, "failed", message);

                  return res.status(500).json({
                        success: false,
                        message,
                        data: { order: updated },
                  });
            }
      } catch (error) {
            console.error("Error retrying provision:", error);
            return res.status(500).json({ success: false, message: "Failed to retry provisioning" });
      }
};

/**
 * Retry sending the confirmation email(s) for an order whose payment is
 * verified but whose email previously failed to send.
 */
export const retryEmail = async (req: Request, res: Response) => {
      try {
            const reference = req.params.reference as string;
            const order = await Sales.findOne({ reference });

            if (!order) {
                  return res.status(404).json({ success: false, message: "Order not found" });
            }

            if (order.payment_status !== "verified") {
                  return res.status(400).json({
                        success: false,
                        message: "Cannot send confirmation email until payment is verified",
                  });
            }

            const orderDetails = {
                  name: order.name,
                  email: order.email || "",
                  phone: order.phone,
                  address: order.address,
                  city: order.city,
                  state: order.state,
                  cardLink: order.cardLink,
                  cardId: order.cardId || "",
                  reference: order.reference,
                  amount: order.amount,
                  currency: order.currency,
                  discount: order.discount || "",
            };

            try {
                  if (order.email) {
                        if (order.discount) {
                              await sendDiscountAppliedEmail(order.email, orderDetails);
                        } else {
                              await sendPaymentSuccessEmail(order.email, orderDetails);
                        }
                  }
                  await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);

                  const updated = await setEmailStatus(reference, "sent");
                  return res.status(200).json({
                        success: true,
                        message: "Emails re-sent",
                        data: { order: updated },
                  });
            } catch (emailError) {
                  const message = emailError instanceof Error ? emailError.message : "Email sending failed";
                  const updated = await setEmailStatus(reference, "failed", message);

                  return res.status(500).json({
                        success: false,
                        message,
                        data: { order: updated },
                  });
            }
      } catch (error) {
            console.error("Error retrying email:", error);
            return res.status(500).json({ success: false, message: "Failed to retry email" });
      }
};

/**
 * Manual override for cases that need a human decision (refunded outside
 * the system, confirmed via bank statement, etc). Any subset of the three
 * sub-states can be set explicitly, with an optional note recorded as last_error.
 */
export const resolveOrder = async (req: Request, res: Response) => {
      try {
            const reference = req.params.reference as string;
            const { payment_status, provision_status, email_status, note } = req.body;

            const set: Record<string, any> = { updated_at: new Date() };

            if (payment_status !== undefined) {
                  if (!PAYMENT_STATUSES.includes(payment_status)) {
                        return res.status(400).json({
                              success: false,
                              message: `payment_status must be one of ${PAYMENT_STATUSES.join(", ")}`,
                        });
                  }
                  set.payment_status = payment_status;
                  set.status =
                        payment_status === "verified"
                              ? "completed"
                              : payment_status === "failed"
                              ? "failed"
                              : "pending";
            }

            if (provision_status !== undefined) {
                  if (!PROVISION_STATUSES.includes(provision_status)) {
                        return res.status(400).json({
                              success: false,
                              message: `provision_status must be one of ${PROVISION_STATUSES.join(", ")}`,
                        });
                  }
                  set.provision_status = provision_status;
            }

            if (email_status !== undefined) {
                  if (!EMAIL_STATUSES.includes(email_status)) {
                        return res.status(400).json({
                              success: false,
                              message: `email_status must be one of ${EMAIL_STATUSES.join(", ")}`,
                        });
                  }
                  set.email_status = email_status;
            }

            if (note !== undefined) {
                  set.last_error = note;
            }

            if (Object.keys(set).length === 1) {
                  return res.status(400).json({ success: false, message: "No fields to update" });
            }

            const order = await Sales.findOneAndUpdate({ reference }, { $set: set }, { new: true });

            if (!order) {
                  return res.status(404).json({ success: false, message: "Order not found" });
            }

            return res.status(200).json({ success: true, message: "Order updated", data: order });
      } catch (error) {
            console.error("Error resolving order:", error);
            return res.status(500).json({ success: false, message: "Failed to resolve order" });
      }
};

/**
 * Aggregate metrics for the admin dashboard.
 */
export const getMetrics = async (req: Request, res: Response) => {
      try {
            const [result] = await Sales.aggregate([
                  {
                        $facet: {
                              totals: [{ $count: "count" }],
                              byPaymentStatus: [{ $group: { _id: "$payment_status", count: { $sum: 1 } } }],
                              byProvisionStatus: [{ $group: { _id: "$provision_status", count: { $sum: 1 } } }],
                              byEmailStatus: [{ $group: { _id: "$email_status", count: { $sum: 1 } } }],
                              revenue: [
                                    { $match: { payment_status: "verified" } },
                                    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
                              ],
                              needsAttention: [
                                    {
                                          $match: {
                                                payment_status: "verified",
                                                $or: [{ provision_status: "failed" }, { email_status: "failed" }],
                                          },
                                    },
                                    { $count: "count" },
                              ],
                              avgAttempts: [{ $group: { _id: null, avg: { $avg: "$attempts" } } }],
                        },
                  },
            ]);

            const toCountMap = (arr: { _id: string | null; count: number }[]) =>
                  arr.reduce(
                        (acc, cur) => ({ ...acc, [cur._id || "unknown"]: cur.count }),
                        {} as Record<string, number>
                  );

            return res.status(200).json({
                  success: true,
                  data: {
                        totalOrders: result.totals[0]?.count || 0,
                        paymentStatus: toCountMap(result.byPaymentStatus),
                        provisionStatus: toCountMap(result.byProvisionStatus),
                        emailStatus: toCountMap(result.byEmailStatus),
                        revenue: {
                              total: result.revenue[0]?.total || 0,
                              verifiedOrders: result.revenue[0]?.count || 0,
                        },
                        needsAttention: result.needsAttention[0]?.count || 0,
                        avgVerificationAttempts: result.avgAttempts[0]?.avg || 0,
                  },
            });
      } catch (error) {
            console.error("Error getting admin metrics:", error);
            return res.status(500).json({ success: false, message: "Failed to get metrics" });
      }
};
