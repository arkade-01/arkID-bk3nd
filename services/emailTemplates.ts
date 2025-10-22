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
 * Email template for buyer - Payment Successful
 */
export const paymentSuccessfulTemplate = (order: OrderDetails): string => {
      return `
<!DOCTYPE html>
<html>
<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
            body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
            }
            .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 20px;
                  text-align: center;
            }
            .header h1 {
                  margin: 0;
                  font-size: 28px;
            }
            .checkmark {
                  font-size: 60px;
                  margin-bottom: 10px;
            }
            .content {
                  padding: 40px 30px;
            }
            .greeting {
                  font-size: 18px;
                  color: #333;
                  margin-bottom: 20px;
            }
            .message {
                  font-size: 16px;
                  color: #666;
                  margin-bottom: 30px;
            }
            .order-details {
                  background: #f9f9f9;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
            }
            .order-details h3 {
                  margin-top: 0;
                  color: #667eea;
                  font-size: 18px;
            }
            .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
                  border-bottom: none;
            }
            .detail-label {
                  font-weight: 600;
                  color: #555;
            }
            .detail-value {
                  color: #333;
            }
            .amount-highlight {
                  background: #667eea;
                  color: white;
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                  margin: 20px 0;
                  font-size: 20px;
                  font-weight: bold;
            }
            .button {
                  display: inline-block;
                  background: #667eea;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: 600;
            }
            .footer {
                  background: #f9f9f9;
                  padding: 30px;
                  text-align: center;
                  color: #999;
                  font-size: 14px;
            }
            .footer p {
                  margin: 5px 0;
            }
      </style>
</head>
<body>
      <div class="container">
            <div class="header">
                  <div class="checkmark">✓</div>
                  <h1>Payment Successful!</h1>
            </div>
            
            <div class="content">
                  <div class="greeting">
                        Hi ${order.name},
                  </div>
                  
                  <div class="message">
                        Thank you for your order! We've successfully received your payment and your arkID card is now being processed.
                  </div>
                  
                  ${order.discount ? `
                  <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <strong style="color: #2e7d32;">🎉 Discount Applied:</strong> ${order.discount}
                  </div>
                  ` : ''}
                  
                  <div class="amount-highlight">
                        ${order.amount === 0 ? 'FREE' : `${order.currency} ${order.amount.toLocaleString()}`}
                  </div>
                  
                  <div class="order-details">
                        <h3>Order Details</h3>
                        
                        <div class="detail-row">
                              <span class="detail-label">Reference:</span>
                              <span class="detail-value">${order.reference}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Card Link:</span>
                              <span class="detail-value">${order.cardLink}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span class="detail-value">${order.email}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Phone:</span>
                              <span class="detail-value">${order.phone}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Delivery Address:</span>
                              <span class="detail-value">${order.address}, ${order.city}, ${order.state}</span>
                        </div>
                  </div>
                  
                  <div class="message">
                        <strong>What's Next?</strong><br>
                        Your arkID card will be prepared and shipped to your address within 3-5 business days. 
                        You'll receive another email with tracking information once your order ships.
                  </div>
                  
                  <center>
                        <a href="${order.cardLink}" class="button">View Your Card</a>
                  </center>
                  
                  <div class="message" style="margin-top: 30px; font-size: 14px; color: #999;">
                        If you have any questions about your order, please reply to this email or contact our support team.
                  </div>
            </div>
            
            <div class="footer">
                  <p><strong>arkID</strong></p>
                  <p>Your Digital Identity Card</p>
                  <p>© ${new Date().getFullYear()} arkID. All rights reserved.</p>
            </div>
      </div>
</body>
</html>
      `;
};

/**
 * Email template for seller - Order Received
 */
export const orderReceivedTemplate = (order: OrderDetails): string => {
      return `
<!DOCTYPE html>
<html>
<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
            body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
            }
            .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                  color: white;
                  padding: 40px 20px;
                  text-align: center;
            }
            .header h1 {
                  margin: 0;
                  font-size: 28px;
            }
            .bell-icon {
                  font-size: 50px;
                  margin-bottom: 10px;
            }
            .content {
                  padding: 40px 30px;
            }
            .alert-box {
                  background: #fff3cd;
                  border-left: 4px solid #ffc107;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
            }
            .alert-box strong {
                  color: #856404;
            }
            .order-summary {
                  background: #f9f9f9;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
            }
            .order-summary h3 {
                  margin-top: 0;
                  color: #2196F3;
                  font-size: 18px;
                  border-bottom: 2px solid #2196F3;
                  padding-bottom: 10px;
            }
            .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 12px 0;
                  border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
                  border-bottom: none;
            }
            .detail-label {
                  font-weight: 600;
                  color: #555;
                  flex: 0 0 40%;
            }
            .detail-value {
                  color: #333;
                  flex: 1;
                  text-align: right;
            }
            .amount-box {
                  background: #2196F3;
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                  margin: 20px 0;
            }
            .amount-label {
                  font-size: 14px;
                  opacity: 0.9;
                  margin-bottom: 5px;
            }
            .amount-value {
                  font-size: 32px;
                  font-weight: bold;
            }
            .action-required {
                  background: #e3f2fd;
                  border: 2px solid #2196F3;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
            }
            .action-required h4 {
                  margin-top: 0;
                  color: #1976D2;
            }
            .action-required ul {
                  margin: 10px 0;
                  padding-left: 20px;
            }
            .action-required li {
                  margin: 8px 0;
            }
            .footer {
                  background: #f9f9f9;
                  padding: 30px;
                  text-align: center;
                  color: #999;
                  font-size: 14px;
            }
            .status-badge {
                  display: inline-block;
                  padding: 5px 15px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  margin-left: 10px;
            }
            .status-paid {
                  background: #4caf50;
                  color: white;
            }
            .status-free {
                  background: #ff9800;
                  color: white;
            }
      </style>
</head>
<body>
      <div class="container">
            <div class="header">
                  <div class="bell-icon">🔔</div>
                  <h1>New Order Received!</h1>
            </div>
            
            <div class="content">
                  <div class="alert-box">
                        <strong>⚡ Action Required:</strong> A new arkID card order has been received and requires processing.
                  </div>
                  
                  <div class="amount-box">
                        <div class="amount-label">Order Value</div>
                        <div class="amount-value">
                              ${order.amount === 0 ? 'FREE' : `${order.currency} ${order.amount.toLocaleString()}`}
                              <span class="status-badge ${order.amount === 0 ? 'status-free' : 'status-paid'}">
                                    ${order.amount === 0 ? 'DISCOUNT APPLIED' : 'PAID'}
                              </span>
                        </div>
                  </div>
                  
                  <div class="order-summary">
                        <h3>📋 Order Information</h3>
                        
                        <div class="detail-row">
                              <span class="detail-label">Order Reference:</span>
                              <span class="detail-value"><strong>${order.reference}</strong></span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Order Date:</span>
                              <span class="detail-value">${new Date().toLocaleString()}</span>
                        </div>
                        
                        ${order.discount ? `
                        <div class="detail-row">
                              <span class="detail-label">Discount Code:</span>
                              <span class="detail-value" style="color: #4caf50; font-weight: bold;">${order.discount}</span>
                        </div>
                        ` : ''}
                  </div>
                  
                  <div class="order-summary">
                        <h3>👤 Customer Details</h3>
                        
                        <div class="detail-row">
                              <span class="detail-label">Name:</span>
                              <span class="detail-value">${order.name}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span class="detail-value">${order.email}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">Phone:</span>
                              <span class="detail-value">${order.phone}</span>
                        </div>
                  </div>
                  
                  <div class="order-summary">
                        <h3>📦 Delivery Information</h3>
                        
                        <div class="detail-row">
                              <span class="detail-label">Address:</span>
                              <span class="detail-value">${order.address}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">City:</span>
                              <span class="detail-value">${order.city}</span>
                        </div>
                        
                        <div class="detail-row">
                              <span class="detail-label">State:</span>
                              <span class="detail-value">${order.state}</span>
                        </div>
                  </div>
                  
                  <div class="order-summary">
                        <h3>🔗 Card Details</h3>
                        
                        <div class="detail-row">
                              <span class="detail-label">Card Link:</span>
                              <span class="detail-value">${order.cardLink}</span>
                        </div>
                  </div>
                  
                  <div class="action-required">
                        <h4>✅ Next Steps:</h4>
                        <ul>
                              <li>Prepare the arkID card with the customer's information</li>
                              <li>Print the card with the provided link: <strong>${order.cardLink}</strong></li>
                              <li>Package the card securely for shipping</li>
                              <li>Ship to: ${order.address}, ${order.city}, ${order.state}</li>
                              <li>Update the customer with tracking information</li>
                        </ul>
                  </div>
                  
                  <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 5px; text-align: center;">
                        <strong>⏰ Estimated Processing Time:</strong> 3-5 Business Days
                  </div>
            </div>
            
            <div class="footer">
                  <p><strong>arkID Admin Notification</strong></p>
                  <p>This is an automated notification for new orders</p>
                  <p>© ${new Date().getFullYear()} arkID. All rights reserved.</p>
            </div>
      </div>
</body>
</html>
      `;
};

/**
 * Email template for discount code applied (optional - for buyer)
 */
export const discountAppliedTemplate = (order: OrderDetails): string => {
      return `
<!DOCTYPE html>
<html>
<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
            body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
            }
            .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                  color: white;
                  padding: 40px 20px;
                  text-align: center;
            }
            .header h1 {
                  margin: 0;
                  font-size: 28px;
            }
            .celebration {
                  font-size: 60px;
                  margin-bottom: 10px;
            }
            .content {
                  padding: 40px 30px;
            }
            .order-details {
                  background: #f9f9f9;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
            }
            .free-badge {
                  background: #4caf50;
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                  font-size: 32px;
                  font-weight: bold;
                  margin: 20px 0;
            }
            .footer {
                  background: #f9f9f9;
                  padding: 30px;
                  text-align: center;
                  color: #999;
                  font-size: 14px;
            }
      </style>
</head>
<body>
      <div class="container">
            <div class="header">
                  <div class="celebration">🎉</div>
                  <h1>Congratulations!</h1>
            </div>
            
            <div class="content">
                  <p style="font-size: 18px; color: #333;">Hi ${order.name},</p>
                  
                  <p style="font-size: 16px; color: #666;">
                        Great news! Your discount code <strong>${order.discount}</strong> has been successfully applied, 
                        and your arkID card is absolutely FREE!
                  </p>
                  
                  <div class="free-badge">
                        FREE! 🎁
                  </div>
                  
                  <div class="order-details">
                        <h3 style="color: #4caf50;">Order Confirmed</h3>
                        <p><strong>Reference:</strong> ${order.reference}</p>
                        <p><strong>Card Link:</strong> ${order.cardLink}</p>
                        <p><strong>Delivery:</strong> ${order.address}, ${order.city}, ${order.state}</p>
                  </div>
                  
                  <p style="font-size: 16px; color: #666;">
                        Your card will be prepared and shipped within 3-5 business days. No payment required!
                  </p>
            </div>
            
            <div class="footer">
                  <p><strong>arkID</strong></p>
                  <p>© ${new Date().getFullYear()} arkID. All rights reserved.</p>
            </div>
      </div>
</body>
</html>
      `;
};

