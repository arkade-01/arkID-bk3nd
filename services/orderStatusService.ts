import { Sales } from "../models/sales";
import { verifyTransaction } from "./paystackService";

export type PaymentStatus = "pending" | "verified" | "failed";
export type ProvisionStatus = "pending" | "provisioned" | "failed";
export type EmailStatus = "pending" | "sent" | "failed";

const deriveLegacyStatus = (
      paymentStatus: PaymentStatus
): "pending" | "completed" | "failed" => {
      if (paymentStatus === "verified") return "completed";
      if (paymentStatus === "failed") return "failed";
      return "pending";
};

/**
 * Record the outcome of a payment verification attempt.
 * Increments `attempts` and keeps the legacy `status` field in sync.
 */
export const setPaymentStatus = async (
      reference: string,
      paymentStatus: PaymentStatus,
      opts: { transactionId?: string; error?: string } = {}
) => {
      const set: Record<string, any> = {
            payment_status: paymentStatus,
            status: deriveLegacyStatus(paymentStatus),
            updated_at: new Date(),
            last_error: opts.error || "",
      };
      if (opts.transactionId) set.transactionId = opts.transactionId;

      return Sales.findOneAndUpdate(
            { reference },
            { $set: set, $inc: { attempts: 1 } },
            { new: true }
      );
};

export const setProvisionStatus = async (
      reference: string,
      provisionStatus: ProvisionStatus,
      error?: string
) => {
      const set: Record<string, any> = {
            provision_status: provisionStatus,
            updated_at: new Date(),
      };
      if (error !== undefined) set.last_error = error;

      return Sales.findOneAndUpdate({ reference }, { $set: set }, { new: true });
};

export const setEmailStatus = async (
      reference: string,
      emailStatus: EmailStatus,
      error?: string
) => {
      const set: Record<string, any> = {
            email_status: emailStatus,
            updated_at: new Date(),
      };
      if (error !== undefined) set.last_error = error;

      return Sales.findOneAndUpdate({ reference }, { $set: set }, { new: true });
};

/**
 * Check and update status of a pending order.
 * Useful for handling abandoned payments.
 */
export const updatePendingOrderStatus = async (reference: string) => {
      try {
            const order = await Sales.findOne({ reference });

            if (!order) {
                  throw new Error("Order not found");
            }

            // Only check if payment is still pending
            if (order.payment_status !== "pending") {
                  return {
                        alreadyProcessed: true,
                        status: order.payment_status,
                  };
            }

            // Verify with Paystack
            try {
                  const verification = await verifyTransaction(reference);

                  if (verification.data.status === "success") {
                        await setPaymentStatus(reference, "verified", {
                              transactionId: verification.data.reference,
                        });

                        return {
                              updated: true,
                              status: "verified",
                        };
                  } else if (verification.data.status === "failed") {
                        await setPaymentStatus(reference, "failed", {
                              error: "Payment failed at gateway",
                        });

                        return {
                              updated: true,
                              status: "failed",
                        };
                  } else {
                        // Payment still pending on Paystack
                        return {
                              updated: false,
                              status: "pending",
                              message: "Payment still pending",
                        };
                  }
            } catch (error) {
                  // If verification fails, payment was likely abandoned
                  return {
                        updated: false,
                        status: "pending",
                        message: "Payment verification failed - likely abandoned",
                  };
            }
      } catch (error) {
            console.error("Error updating pending order status:", error);
            throw error;
      }
};

/**
 * Mark old pending orders (abandoned checkouts) as failed, e.g. older than 24 hours
 */
export const expirePendingOrders = async (hoursOld: number = 24) => {
      try {
            const expiryTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

            const result = await Sales.updateMany(
                  {
                        payment_status: "pending",
                        createdAt: { $lt: expiryTime },
                  },
                  {
                        $set: {
                              payment_status: "failed",
                              status: "failed",
                              last_error: `Expired - no confirmation after ${hoursOld}h`,
                              updated_at: new Date(),
                        },
                  }
            );

            return {
                  expiredCount: result.modifiedCount,
            };
      } catch (error) {
            console.error("Error expiring pending orders:", error);
            throw error;
      }
};

/**
 * Get all pending orders that might be abandoned
 */
export const getPendingOrders = async (minutesOld: number = 30) => {
      try {
            const threshold = new Date(Date.now() - minutesOld * 60 * 1000);

            const pendingOrders = await Sales.find({
                  payment_status: "pending",
                  createdAt: { $lt: threshold },
            });

            return pendingOrders;
      } catch (error) {
            console.error("Error getting pending orders:", error);
            throw error;
      }
};
