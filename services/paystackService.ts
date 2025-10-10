import axios from "axios";
import { config } from "../config/config";

const url = config.URL || "https://api.paystack.co";
const secret = config.SECRET;
const paystack = axios.create({
      baseURL: url,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
});

interface PaystackTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerificationData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string;
  channel: string;
  customer: {
    email: string;
  };
}

export const initializeTransaction = async (
  email: string,
  amount: number,
  reference?: string
): Promise<{ data: PaystackTransactionResponse }> => {
  try {
    const amountinKobo = amount * 100;
    const transactionReference = reference || `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = await paystack.post<{ data: PaystackTransactionResponse }>("/transaction/initialize", {
      email: email,
      amount: amountinKobo,
      reference: transactionReference,
      channels: ["card"],
      callback_url: config.CALLBACK_URL
    });
    console.log("Transaction Initialized", transaction.data);

    return transaction.data;
  } catch (error) {
    console.error("Error Initializing Transaction", error);
    throw new Error("Failed to initialize transaction");
  }
};

/**
 * Verify a Paystack transaction
 */
export const verifyTransaction = async (reference: string) => {
  try {
    const verification = await paystack.get<{ data: PaystackVerificationData }>(
      `/transaction/verify/${reference}`
    );
    console.log("Transaction Verified", verification.data);

    return verification.data;
  } catch (error) {
    console.error("Error Verifying Transaction", error);
    throw new Error("Failed to verify transaction");
  }
};