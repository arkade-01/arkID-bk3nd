import { Request, Response } from "express";
import { initializeTransaction } from "../services/paystackService";
import { Sales } from "../models/sales";
import { validateDiscountCode, incrementDiscountUsage } from "../services/discountService";
import { sendDiscountAppliedEmail, sendOrderReceivedEmail } from "../services/emailService";
import { config } from "../config/config";

export const createOrder = async (req: Request, res: Response) => {
      try {
            const { 
                  name, 
                  cardLink, 
                  phone, 
                  address, 
                  amount,
                  city, 
                  state, 
                  currency, 
                  discountCode,
                  email 
            } = req.body;

            // Check if there's a discount code
            if (discountCode && discountCode.trim() !== "") {
                  // Validate the discount code
                  const validation = await validateDiscountCode(discountCode);
                  
                  if (!validation.valid) {
                        return res.status(400).json({
                              success: false,
                              message: validation.message
                        });
                  }
                  
                  // If discount code is valid, create order with zero amount and no transaction
                  const sales = await Sales.create({
                        name,
                        cardLink,
                        phone,
                        address,
                        city,
                        state,
                        country: state, // Using state as country for now
                        currency,
                        discount: discountCode.toUpperCase(),
                        email: email || "",
                        amount: 0,
                        transactionId: "DISCOUNT_APPLIED",
                        reference: `DISC_${Date.now()}`,
                        status: "completed"
                  });
                  
                  // Increment the usage count of the discount code
                  await incrementDiscountUsage(discountCode);
                  
                  // Send emails to buyer and seller
                  try {
                        const customerEmail = sales.email || "";
                        const orderDetails = {
                              name: sales.name,
                              email: customerEmail,
                              phone: sales.phone,
                              address: sales.address,
                              city: sales.city,
                              state: sales.state,
                              cardLink: sales.cardLink,
                              reference: sales.reference,
                              amount: sales.amount,
                              currency: sales.currency,
                              discount: sales.discount || ""
                        };

                        // Send free order confirmation to buyer (only if email exists)
                        if (customerEmail) {
                              await sendDiscountAppliedEmail(customerEmail, orderDetails);
                        }
                        
                        // Notify seller/admin
                        await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);
                        
                        console.log(`✅ Emails sent for discount order ${sales.reference}`);
                  } catch (emailError) {
                        console.error("⚠️ Email sending failed:", emailError);
                        // Don't fail the order if email fails
                  }
                  
                  return res.status(201).json({
                        success: true,
                        message: "Order created with discount code",
                        data: sales
                  });
            } else {
                  // No discount code, initialize transaction with actual amount
                  // You may want to define the base amount here or pass it from frontend
                  // const baseAmount = 10000; // Example: ₦10,000 or adjust as needed
                  
                  // Generate unique reference for this order
                  const orderReference = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  
                  // Initialize Paystack transaction with callback URL
                  const transactionResponse = await initializeTransaction(email, amount, orderReference);
                  
                  const sales = await Sales.create({
                        name,
                        cardLink,
                        phone,
                        address,
                        city,
                        state,
                        country: state,
                        currency,
                        discount: "",
                        email,
                        amount,
                        transactionId: transactionResponse.data.access_code,
                        reference: transactionResponse.data.reference,
                        status: "pending"
                  });
                  
                  return res.status(201).json({
                        success: true,
                        message: "Transaction initialized. Please complete payment.",
                        data: {
                              order: sales,
                              reference: transactionResponse.data.reference
                        },
                        paymentUrl: transactionResponse.data.authorization_url
                  });
            }
      } catch (error) {
            console.error("Error creating order:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to create order",
                  error: error instanceof Error ? error.message : "Unknown error"
            });
      }
};