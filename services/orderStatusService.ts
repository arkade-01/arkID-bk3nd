import { Sales } from "../models/sales";
import { verifyTransaction } from "./paystackService";

/**
 * Check and update status of pending orders
 * Useful for handling abandoned payments
 */
export const updatePendingOrderStatus = async (reference: string) => {
      try {
            const order = await Sales.findOne({ reference });
            
            if (!order) {
                  throw new Error("Order not found");
            }
            
            // Only check if order is still pending
            if (order.status !== "pending") {
                  return {
                        alreadyProcessed: true,
                        status: order.status
                  };
            }
            
            // Verify with Paystack
            try {
                  const verification = await verifyTransaction(reference);
                  
                  if (verification.data.status === "success") {
                        await Sales.findOneAndUpdate(
                              { reference },
                              { 
                                    status: "completed",
                                    transactionId: verification.data.reference
                              }
                        );
                        
                        return {
                              updated: true,
                              status: "completed"
                        };
                  } else if (verification.data.status === "failed") {
                        await Sales.findOneAndUpdate(
                              { reference },
                              { status: "failed" }
                        );
                        
                        return {
                              updated: true,
                              status: "failed"
                        };
                  } else {
                        // Payment still pending on Paystack
                        return {
                              updated: false,
                              status: "pending",
                              message: "Payment still pending"
                        };
                  }
            } catch (error) {
                  // If verification fails, payment was likely abandoned
                  return {
                        updated: false,
                        status: "pending",
                        message: "Payment verification failed - likely abandoned"
                  };
            }
      } catch (error) {
            console.error("Error updating pending order status:", error);
            throw error;
      }
};

/**
 * Cancel/expire old pending orders (e.g., older than 24 hours)
 */
export const expirePendingOrders = async (hoursOld: number = 24) => {
      try {
            const expiryTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
            
            const result = await Sales.updateMany(
                  {
                        status: "pending",
                        createdAt: { $lt: expiryTime }
                  },
                  {
                        status: "expired"
                  }
            );
            
            return {
                  expiredCount: result.modifiedCount
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
                  status: "pending",
                  createdAt: { $lt: threshold }
            });
            
            return pendingOrders;
      } catch (error) {
            console.error("Error getting pending orders:", error);
            throw error;
      }
};

