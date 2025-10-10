# 📧 Email Integration with Payment Callback

Complete guide on how emails are automatically sent when payments are processed.

---

## 🔄 How It Works

### Payment Flow with Automatic Emails

```
1. User creates order
   ↓
2. User pays on Paystack
   ↓
3. Paystack redirects to CALLBACK_URL (/api/payments/callback)
   ↓
4. Backend verifies payment
   ↓
5. Order status updated to "completed"
   ↓
6. 📧 EMAILS SENT AUTOMATICALLY
   ├─ Buyer: Payment successful confirmation
   └─ Seller: New order notification
   ↓
7. User redirected to frontend success page
```

### Discount Code Flow with Automatic Emails

```
1. User creates order with discount code
   ↓
2. Discount code validated
   ↓
3. Order created with status "completed" (amount: 0)
   ↓
4. 📧 EMAILS SENT AUTOMATICALLY
   ├─ Buyer: Free order celebration email
   └─ Seller: New order notification
   ↓
5. Response sent to frontend
```

---

## ✅ What's Been Integrated

### 1. Payment Callback Handler (`controller/paymentController.ts`)

**When payment succeeds:**
- ✅ Verifies payment with Paystack
- ✅ Updates order status to "completed"
- ✅ Sends **Payment Successful** email to buyer
- ✅ Sends **Order Received** email to seller
- ✅ Redirects user to success page

**Email sending code:**
```typescript
// Send confirmation to buyer (only if email exists)
if (order.email) {
    await sendPaymentSuccessEmail(order.email, orderDetails);
}

// Notify seller/admin
await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);
```

### 2. Order Controller (`controller/orderController.ts`)

**When discount code is used:**
- ✅ Validates discount code
- ✅ Creates order with amount: 0
- ✅ Sends **Discount Applied** email to buyer
- ✅ Sends **Order Received** email to seller
- ✅ Returns success response

**Email sending code:**
```typescript
// Send free order confirmation to buyer (only if email exists)
if (customerEmail) {
    await sendDiscountAppliedEmail(customerEmail, orderDetails);
}

// Notify seller/admin
await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);
```

---

## 📝 Configuration

### Required Environment Variables

```env
# Paystack Callback URL (where Paystack redirects after payment)
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/callback

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="arkID <noreply@arkid.com>"
EMAIL_SUBJECT_PREFIX=[arkID]

# Seller Email (receives order notifications)
SELLER_EMAIL=admin@arkid.com

# Frontend URL (where users are redirected after callback)
FRONTEND_URL=http://localhost:3001
```

---

## 🎯 Email Triggers

### Trigger 1: Payment Callback Success

**When:** User completes payment on Paystack
**Endpoint:** `GET /api/payments/callback?reference=XXX`
**Emails Sent:**
1. **To Buyer:** Payment Successful (purple design)
2. **To Seller:** Order Received (blue design)

**Code Location:** `/controller/paymentController.ts` - `handlePaymentCallback()`

### Trigger 2: Discount Code Applied

**When:** Order created with valid discount code
**Endpoint:** `POST /api/orders` (with discountCode in body)
**Emails Sent:**
1. **To Buyer:** Discount Applied (green design)
2. **To Seller:** Order Received (blue design)

**Code Location:** `/controller/orderController.ts` - `createOrder()`

---

## 📧 Emails Sent

### 1. Payment Successful Email (Buyer)
- **Subject:** `[arkID] Payment Successful`
- **Design:** Purple gradient header with checkmark
- **Content:**
  - Order confirmation
  - Amount paid
  - Order reference
  - Delivery details
  - Card link
  - What's next info

### 2. Order Received Email (Seller)
- **Subject:** `[arkID] Order Received`
- **Design:** Blue gradient header with bell
- **Content:**
  - Action required alert
  - Order value (PAID/FREE badge)
  - Customer details
  - Delivery information
  - Card link to print
  - Processing checklist

### 3. Discount Applied Email (Buyer)
- **Subject:** `[arkID] Discount Code Applied`
- **Design:** Green gradient header with celebration
- **Content:**
  - Congratulations message
  - Discount code used
  - FREE badge
  - Order details
  - Delivery timeline

---

## 🔒 Error Handling

Emails are sent with **safe error handling** - they won't break your order flow:

```typescript
try {
    // Send emails
    await sendPaymentSuccessEmail(order.email, orderDetails);
    await sendOrderReceivedEmail(config.EMAIL.SELLER_EMAIL, orderDetails);
    console.log(`✅ Emails sent for order ${order.reference}`);
} catch (emailError) {
    console.error("⚠️ Email sending failed:", emailError);
    // Don't fail the callback if email fails
}
```

**What this means:**
- ✅ Order still completes even if email fails
- ✅ Payment status still updates
- ✅ User still redirected properly
- ⚠️ Error logged for debugging

---

## 🧪 Testing

### Test Email Flow

1. **Create a test discount code:**
```bash
curl -X POST http://localhost:3000/api/discounts \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST2024", "usageLimit": 10}'
```

2. **Create order with discount:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "cardLink": "https://test.com",
    "phone": "+2348012345678",
    "address": "123 Test St",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "buyer@example.com",
    "discountCode": "TEST2024"
  }'
```

3. **Check your email:**
- Buyer email should receive "Discount Applied"
- Seller email should receive "Order Received"

4. **Test payment flow:**
```bash
# Create order without discount
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "cardLink": "https://test.com",
    "phone": "+2348012345678",
    "address": "123 Test St",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "buyer@example.com"
  }'
```

5. **Complete payment on Paystack:**
- Use test card: `4084084084084081`
- Complete the payment
- Paystack will redirect to callback URL
- Emails will be sent automatically

---

## 🔍 Monitoring

### Check if emails were sent

Look for these logs in your console:

```bash
✅ Emails sent for order ORD_123456789
✅ Payment success email sent to buyer@example.com
✅ Order notification sent to seller admin@arkid.com
```

### If emails fail

```bash
⚠️ Email sending failed: Error: Invalid login
```

**Common issues:**
- Wrong email credentials in `.env`
- Gmail requires app password (not regular password)
- Email service blocked by firewall
- Invalid recipient email address

---

## 📊 Email Flow Diagram

```
ORDER CREATION
┌─────────────────────────────────────┐
│  With Discount Code                 │
├─────────────────────────────────────┤
│  1. Validate discount code          │
│  2. Create order (amount: 0)        │
│  3. Send emails:                    │
│     ├─ Buyer: Discount Applied 🎉  │
│     └─ Seller: Order Received 🔔   │
│  4. Return success response         │
└─────────────────────────────────────┘

PAYMENT CALLBACK
┌─────────────────────────────────────┐
│  After Paystack Payment             │
├─────────────────────────────────────┤
│  1. Verify payment with Paystack    │
│  2. Update order status             │
│  3. Send emails:                    │
│     ├─ Buyer: Payment Success ✓    │
│     └─ Seller: Order Received 🔔   │
│  4. Redirect to success page        │
└─────────────────────────────────────┘
```

---

## 🎨 Customization

### Change Seller Email

Update `.env`:
```env
SELLER_EMAIL=orders@yourdomain.com
```

### Add Multiple Seller Emails

Modify `emailService.ts`:
```typescript
const sellerEmails = [
    config.EMAIL.SELLER_EMAIL,
    "admin2@arkid.com",
    "warehouse@arkid.com"
];

for (const email of sellerEmails) {
    await sendOrderReceivedEmail(email, orderDetails);
}
```

### Customize Email Content

Edit templates in `/services/emailTemplates.ts`:
- Change colors, fonts, layout
- Add your logo
- Modify text content

---

## ✅ Checklist

Before going live, make sure:

- [ ] Email credentials configured in `.env`
- [ ] Seller email set in `SELLER_EMAIL`
- [ ] Gmail app password generated (if using Gmail)
- [ ] Test emails sent successfully
- [ ] Callback URL is publicly accessible (not localhost)
- [ ] Frontend success/failure pages exist
- [ ] Email templates customized with your branding

---

## 🎉 Benefits

✨ **Automatic** - No manual email sending required
✨ **Reliable** - Doesn't break order flow if email fails
✨ **Complete** - Both buyer and seller notified
✨ **Professional** - Beautiful HTML templates
✨ **Instant** - Emails sent immediately after payment
✨ **Trackable** - Console logs for monitoring

---

**Your email system is fully integrated with the payment callback! 📧✅**

Every successful payment automatically triggers beautiful email notifications to both buyers and sellers.

