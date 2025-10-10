import { transporter, mailConfig, getEmailSubject } from '../config/nodemailerConfig';
import { paymentSuccessfulTemplate, orderReceivedTemplate, discountAppliedTemplate } from './emailTemplates';

interface OrderDetails {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      cardLink: string;
      reference: string;
      amount: number;
      currency: string;
      discount?: string;
}

/**
 * Send payment successful email to buyer
 */
export const sendPaymentSuccessEmail = async (
      customerEmail: string,
      orderDetails: OrderDetails
): Promise<void> => {
      try {
            await transporter.sendMail({
                  from: mailConfig.from,
                  to: customerEmail,
                  subject: getEmailSubject('Payment Successful'),
                  html: paymentSuccessfulTemplate(orderDetails)
            });
            
            console.log(`✅ Payment success email sent to ${customerEmail}`);
      } catch (error) {
            console.error('❌ Error sending payment success email:', error);
            throw error;
      }
};

/**
 * Send order received notification to seller/admin
 */
export const sendOrderReceivedEmail = async (
      sellerEmail: string,
      orderDetails: OrderDetails
): Promise<void> => {
      try {
            await transporter.sendMail({
                  from: mailConfig.from,
                  to: sellerEmail,
                  subject: getEmailSubject('Order Received'),
                  html: orderReceivedTemplate(orderDetails)
            });
            
            console.log(`✅ Order notification sent to seller ${sellerEmail}`);
      } catch (error) {
            console.error('❌ Error sending order notification:', error);
            throw error;
      }
};

/**
 * Send discount applied email to buyer (when discount code is used)
 */
export const sendDiscountAppliedEmail = async (
      customerEmail: string,
      orderDetails: OrderDetails
): Promise<void> => {
      try {
            await transporter.sendMail({
                  from: mailConfig.from,
                  to: customerEmail,
                  subject: getEmailSubject('Discount Code Applied'),
                  html: discountAppliedTemplate(orderDetails)
            });
            
            console.log(`✅ Discount applied email sent to ${customerEmail}`);
      } catch (error) {
            console.error('❌ Error sending discount email:', error);
            throw error;
      }
};

/**
 * Send both buyer and seller emails for an order
 */
export const sendOrderEmails = async (
      customerEmail: string,
      sellerEmail: string,
      orderDetails: OrderDetails,
      hasDiscount: boolean = false
): Promise<void> => {
      try {
            // Send appropriate email to buyer
            if (hasDiscount && orderDetails.amount === 0) {
                  await sendDiscountAppliedEmail(customerEmail, orderDetails);
            } else {
                  await sendPaymentSuccessEmail(customerEmail, orderDetails);
            }
            
            // Always send notification to seller
            await sendOrderReceivedEmail(sellerEmail, orderDetails);
            
            console.log('✅ All order emails sent successfully');
      } catch (error) {
            console.error('❌ Error sending order emails:', error);
            // Don't throw - we don't want email failures to break the order flow
      }
};

