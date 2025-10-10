# 📧 Email Service Usage Guide

Complete guide for using email notifications in your arkID backend.

---

## 📋 Email Templates

### 1. **Payment Successful** (Buyer Email)
- **Purpose:** Confirm payment and order details to customer
- **Includes:** Order reference, amount paid, delivery address, card link
- **Design:** Purple gradient header with checkmark

### 2. **Order Received** (Seller Email)
- **Purpose:** Notify admin/seller of new order for processing
- **Includes:** Full customer details, delivery info, action checklist
- **Design:** Blue gradient header with bell icon

### 3. **Discount Applied** (Buyer Email)
- **Purpose:** Celebrate free order with discount code
- **Includes:** Discount code used, free order confirmation
- **Design:** Green gradient header with celebration emoji

---

## ⚙️ Setup

### 1. Add to `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="arkID <noreply@arkid.com>"
EMAIL_SUBJECT_PREFIX=[arkID]

# Seller/Admin Email (for order notifications)
SELLER_EMAIL=admin@arkid.com
```

### 2. Update `config.ts`:

```typescript
export const config = {
      // ... existing config
      EMAIL: {
            // ... existing email config
            SELLER_EMAIL: process.env.SELLER_EMAIL || "admin@arkid.com"
      }
}
```

---

## 🎯 Usage Examples

### Example 1: Send Emails in Order Controller

```typescript
import { sendOrderEmails } from '../services/emailService';
import { config } from '../config/config';

export const createOrder = async (req: Request, res: Response) => {
      try {
            // ... create order logic ...
            
            const orderDetails = {
                  name: sales.name,
                  email: sales.email,
                  phone: sales.phone,
                  address: sales.address,
                  city: sales.city,
                  state: sales.state,
                  cardLink: sales.cardLink,
                  reference: sales.reference,
                  amount: sales.amount,
                  currency: sales.currency,
                  discount: sales.discount
            };
            
            // Send emails to both buyer and seller
            await sendOrderEmails(
                  sales.email,              // Customer email
                  config.EMAIL.SELLER_EMAIL, // Seller email
                  orderDetails,
                  !!sales.discount           // Has discount?
            );
            
            return res.status(201).json({
                  success: true,
                  data: sales
            });
      } catch (error) {
            // Handle error
      }
};
```

### Example 2: Send Email After Payment Callback

```typescript
import { sendPaymentSuccessEmail, sendOrderReceivedEmail } from '../services/emailService';
import { config } from '../config/config';

export const handlePaymentCallback = async (req: Request, res: Response) => {
      try {
            // ... verify payment ...
            
            if (verification.data.status === "success") {
                  // Update order status
                  const order = await Sales.findOneAndUpdate(/* ... */);
                  
                  // Prepare order details
                  const orderDetails = {
                        name: order.name,
                        email: order.email,
                        phone: order.phone,
                        address: order.address,
                        city: order.city,
                        state: order.state,
                        cardLink: order.cardLink,
                        reference: order.reference,
                        amount: order.amount,
                        currency: order.currency
                  };
                  
                  // Send confirmation to buyer
                  await sendPaymentSuccessEmail(order.email, orderDetails);
                  
                  // Notify seller
                  await sendOrderReceivedEmail(
                        config.EMAIL.SELLER_EMAIL,
                        orderDetails
                  );
                  
                  // Redirect user
                  return res.redirect(/* ... */);
            }
      } catch (error) {
            // Handle error
      }
};
```

### Example 3: Send Discount Email Only

```typescript
import { sendDiscountAppliedEmail } from '../services/emailService';

// When discount code is used
if (discountCode && validation.valid) {
      const sales = await Sales.create({
            // ... order data ...
            amount: 0,
            status: "completed"
      });
      
      const orderDetails = {
            name: sales.name,
            email: sales.email,
            phone: sales.phone,
            address: sales.address,
            city: sales.city,
            state: sales.state,
            cardLink: sales.cardLink,
            reference: sales.reference,
            amount: 0,
            currency: sales.currency,
            discount: discountCode
      };
      
      // Send free order confirmation
      await sendDiscountAppliedEmail(sales.email, orderDetails);
      
      // Notify seller about free order
      await sendOrderReceivedEmail(
            config.EMAIL.SELLER_EMAIL,
            orderDetails
      );
}
```

---

## 🎨 Email Templates Preview

### Payment Successful Email (Buyer)
```
┌─────────────────────────────────┐
│   ✓                             │
│   Payment Successful!           │
│   (Purple gradient header)      │
├─────────────────────────────────┤
│                                 │
│   Hi John Doe,                  │
│                                 │
│   Thank you for your order!     │
│                                 │
│   ┌──────────────────────┐     │
│   │   NGN 10,000         │     │
│   └──────────────────────┘     │
│                                 │
│   Order Details:                │
│   • Reference: ORD_123...       │
│   • Card Link: https://...      │
│   • Email: john@example.com     │
│   • Phone: +234801234567        │
│   • Address: 123 Main St...     │
│                                 │
│   What's Next?                  │
│   Your card will ship in 3-5    │
│   business days.                │
│                                 │
│   [View Your Card]              │
│                                 │
└─────────────────────────────────┘
```

### Order Received Email (Seller)
```
┌─────────────────────────────────┐
│   🔔                            │
│   New Order Received!           │
│   (Blue gradient header)        │
├─────────────────────────────────┤
│                                 │
│   ⚡ Action Required            │
│                                 │
│   ┌──────────────────────┐     │
│   │   NGN 10,000 [PAID]  │     │
│   └──────────────────────┘     │
│                                 │
│   📋 Order Information          │
│   • Reference: ORD_123...       │
│   • Date: Oct 9, 2024...        │
│                                 │
│   👤 Customer Details           │
│   • Name: John Doe              │
│   • Email: john@example.com     │
│   • Phone: +234801234567        │
│                                 │
│   📦 Delivery Information       │
│   • Address: 123 Main St        │
│   • City: Lagos                 │
│   • State: Lagos                │
│                                 │
│   🔗 Card Details               │
│   • Link: https://...           │
│                                 │
│   ✅ Next Steps:                │
│   1. Prepare the card           │
│   2. Print with link            │
│   3. Package securely           │
│   4. Ship to address            │
│   5. Send tracking info         │
│                                 │
└─────────────────────────────────┘
```

### Discount Applied Email (Buyer)
```
┌─────────────────────────────────┐
│   🎉                            │
│   Congratulations!              │
│   (Green gradient header)       │
├─────────────────────────────────┤
│                                 │
│   Hi John Doe,                  │
│                                 │
│   Your discount code WELCOME2024│
│   has been applied!             │
│                                 │
│   ┌──────────────────────┐     │
│   │   FREE! 🎁           │     │
│   └──────────────────────┘     │
│                                 │
│   Order Confirmed               │
│   • Reference: ORD_123...       │
│   • Card Link: https://...      │
│   • Delivery: 123 Main St...    │
│                                 │
│   Your card will ship in 3-5    │
│   days. No payment required!    │
│                                 │
└─────────────────────────────────┘
```

---

## 🔧 Customization

### Modify Email Templates

Edit `/services/emailTemplates.ts`:

```typescript
// Change colors
background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);

// Change content
<p>Your custom message here</p>

// Add your logo
<img src="https://your-domain.com/logo.png" alt="Logo" style="max-width: 150px;">
```

### Add New Email Types

1. **Add to type definition:**
```typescript
// config/nodemailerConfig.ts
export type EmailPurpose = 
      'Order Received' | 
      'Payment Successful' | 
      'Discount Code Applied' |
      'Order Shipped';  // NEW
```

2. **Add subject:**
```typescript
subjects: {
      'Order Received': 'Order Received',
      'Payment Successful': 'Payment Successful',
      'Discount Code Applied': 'Discount Code Applied',
      'Order Shipped': 'Your Order Has Shipped'  // NEW
}
```

3. **Create template in `emailTemplates.ts`:**
```typescript
export const orderShippedTemplate = (order: OrderDetails, trackingNumber: string): string => {
      return `<!-- Your HTML template -->`;
};
```

4. **Create sender function in `emailService.ts`:**
```typescript
export const sendOrderShippedEmail = async (
      customerEmail: string,
      orderDetails: OrderDetails,
      trackingNumber: string
): Promise<void> => {
      // Implementation
};
```

---

## 📧 Gmail Setup (Detailed)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "arkID Backend"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Paste app password
EMAIL_FROM="arkID <noreply@arkid.com>"
```

---

## 🧪 Testing Emails

### Test Email Sending

Create a test script `test-email.ts`:

```typescript
import { sendPaymentSuccessEmail } from './services/emailService';

const testOrder = {
      name: "Test User",
      email: "your-test-email@gmail.com",
      phone: "+2348012345678",
      address: "123 Test St",
      city: "Lagos",
      state: "Lagos",
      cardLink: "https://example.com/card",
      reference: "TEST_123",
      amount: 10000,
      currency: "NGN"
};

sendPaymentSuccessEmail("your-test-email@gmail.com", testOrder)
      .then(() => console.log("Test email sent!"))
      .catch(err => console.error("Error:", err));
```

Run:
```bash
npx ts-node test-email.ts
```

---

## 🚨 Error Handling

Emails are sent asynchronously and won't break your order flow if they fail:

```typescript
try {
      await sendOrderEmails(/* ... */);
} catch (error) {
      console.error('Email error:', error);
      // Order still succeeds even if email fails
}
```

---

## 📊 Best Practices

1. **Always send seller notification** - So you know about every order
2. **Don't block order creation** - Send emails asynchronously
3. **Log email errors** - But don't fail the order
4. **Use app passwords** - Never use your main email password
5. **Test with real emails** - Before going live
6. **Customize templates** - Add your branding
7. **Monitor email delivery** - Check spam folders initially

---

## 🔒 Security Notes

- Never commit `.env` file to git
- Use app-specific passwords for Gmail
- Don't expose email credentials in logs
- Consider using a dedicated email service (SendGrid, Mailgun) for production

---

## 📝 Files Created

- ✅ `/services/emailTemplates.ts` - HTML email templates
- ✅ `/services/emailService.ts` - Email sending functions
- ✅ `/config/nodemailerConfig.ts` - Nodemailer configuration
- ✅ `/EMAIL_USAGE_GUIDE.md` - This guide

---

**Your email system is ready! 📧**

Just add your email credentials to `.env` and start sending beautiful emails to your customers!

