# Payment Flow Guide

Complete guide for handling Paystack payments with automatic status updates and redirects.

## 🔄 Payment Flow

```
1. User creates order → Order saved with status "pending"
2. User redirected to Paystack payment page
3. User completes payment on Paystack
4. Paystack redirects to callback URL → Status updated to "completed"
5. Paystack sends webhook → Additional verification (optional)
6. User redirected to frontend success page
```

## 📝 Step-by-Step Implementation

### Step 1: Create Order Without Discount Code

**Request:**
```bash
POST /api/orders
{
  "name": "John Doe",
  "cardLink": "https://mycard.com/john",
  "phone": "+2348012345678",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos",
  "currency": "NGN",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction initialized. Please complete payment.",
  "data": {
    "order": {
      "_id": "...",
      "reference": "ORD_1728492000000_abc123xyz",
      "status": "pending",
      ...
    },
    "reference": "ORD_1728492000000_abc123xyz"
  },
  "paymentUrl": "https://checkout.paystack.com/..."
}
```

### Step 2: Redirect User to Payment Page

```javascript
// Frontend code
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});

const data = await response.json();

if (data.success && data.paymentUrl) {
  // Redirect user to Paystack payment page
  window.location.href = data.paymentUrl;
}
```

### Step 3: User Completes Payment

After payment, Paystack automatically redirects to:
```
http://localhost:3000/api/payments/callback?reference=ORD_1728492000000_abc123xyz
```

The callback handler:
1. Verifies payment with Paystack
2. Updates order status to "completed" or "failed"
3. Redirects user to your frontend

### Step 4: Handle Frontend Redirects

Configure these pages in your frontend:

**Success Page:**
```
http://localhost:3001/payment/success?reference=ORD_xxx&order=123
```

**Failed Page:**
```
http://localhost:3001/payment/failed?reference=ORD_xxx
```

**Error Page:**
```
http://localhost:3001/payment/error?message=Error+message
```

## 🔗 API Endpoints

### Payment Callback (Auto-called by Paystack)
`GET /api/payments/callback?reference=ORD_xxx`

This endpoint:
- Verifies payment with Paystack
- Updates order status in database
- Redirects user to success/fail page

### Verify Payment (Manual Verification)
`GET /api/payments/verify/:reference`

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentStatus": "success",
    "order": {
      "_id": "...",
      "status": "completed",
      ...
    }
  }
}
```

### Get Order Status
`GET /api/payments/status/:reference`

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "ORD_1728492000000_abc123xyz",
    "status": "completed",
    "amount": 10000,
    "currency": "NGN",
    "createdAt": "2024-10-09T12:00:00.000Z"
  }
}
```

### Webhook (Called by Paystack Servers)
`POST /api/payments/webhook`

Handles these events:
- `charge.success` - Payment successful
- `charge.failed` - Payment failed

## ⚙️ Configuration

Update your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET=sk_test_your_secret_key
PAYSTACK_URL=https://api.paystack.co
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/callback

# Frontend URL (where users are redirected after payment)
FRONTEND_URL=http://localhost:3001

# For production
# PAYSTACK_CALLBACK_URL=https://api.yourdomain.com/api/payments/callback
# FRONTEND_URL=https://yourdomain.com
```

## 🌐 Setting Up Webhook on Paystack Dashboard

1. Login to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Go to Settings → Webhooks
3. Add webhook URL: `https://api.yourdomain.com/api/payments/webhook`
4. Save

**Note:** Webhooks require a public URL (won't work with localhost). For testing:
- Use ngrok: `ngrok http 3000`
- Or rely on callback URL instead

## 🎨 Frontend Example (React)

### Success Page
```jsx
// /payment/success
import { useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const orderId = searchParams.get('order');

  return (
    <div>
      <h1>✓ Payment Successful!</h1>
      <p>Your order has been confirmed.</p>
      <p>Reference: {reference}</p>
      <p>Order ID: {orderId}</p>
    </div>
  );
}
```

### Check Payment Status
```jsx
async function checkPaymentStatus(reference) {
  const response = await fetch(`/api/payments/status/${reference}`);
  const data = await response.json();
  
  return data.data.status; // "pending", "completed", or "failed"
}
```

## 🔒 Security

1. **Webhook Verification**: Webhooks are verified using HMAC signature
2. **Payment Verification**: Always verify with Paystack before updating status
3. **Reference Uniqueness**: Each order has a unique reference

## 📊 Payment Status Flow

```
pending → (payment successful) → completed
        → (payment failed)     → failed
```

## 🧪 Testing

### Test with Paystack Test Cards

**Successful Payment:**
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card: `4084080000000408`

### Test Callback Manually
```bash
# Simulate successful callback
curl "http://localhost:3000/api/payments/callback?reference=ORD_xxx"
```

### Verify Payment
```bash
curl http://localhost:3000/api/payments/verify/ORD_xxx
```

## 🐛 Troubleshooting

### User not redirected after payment
- Check `PAYSTACK_CALLBACK_URL` in .env
- Ensure callback URL is publicly accessible
- Check Paystack dashboard for transaction status

### Order status not updating
- Verify Paystack secret key is correct
- Check server logs for errors
- Manually verify payment using `/verify/:reference` endpoint

### Webhook not working
- Webhooks require public URL (use ngrok for testing)
- Verify webhook URL in Paystack dashboard
- Check webhook signature verification

## 💡 Best Practices

1. **Always verify payments server-side** - Never trust client-side verification
2. **Use unique references** - Prevents duplicate orders
3. **Handle all payment statuses** - pending, completed, failed
4. **Set up webhooks** - For real-time updates even if user closes browser
5. **Log everything** - Keep track of all payment events
6. **Test thoroughly** - Use Paystack test mode before going live

## 🔄 Complete Frontend Integration Example

```javascript
// Create order and initialize payment
async function initiatePayment(orderData) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (data.success && data.paymentUrl) {
      // Save reference for later verification
      localStorage.setItem('paymentReference', data.data.reference);
      
      // Redirect to payment
      window.location.href = data.paymentUrl;
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
}

// Check status after redirect
async function checkPaymentStatus() {
  const reference = localStorage.getItem('paymentReference');
  
  if (reference) {
    const response = await fetch(`/api/payments/status/${reference}`);
    const data = await response.json();
    
    console.log('Payment status:', data.data.status);
    localStorage.removeItem('paymentReference');
  }
}
```

---

## 📚 Related Files

- `/controller/paymentController.ts` - Payment handling logic
- `/services/paystackService.ts` - Paystack API integration
- `/routes/paymentRoutes.ts` - Payment API routes
- `/controller/orderController.ts` - Order creation logic

