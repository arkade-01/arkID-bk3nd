# 🎉 Complete Setup Guide - Payment Integration with Redirects

## ✅ What's Been Built

Your arkID backend now has a **complete payment system** with:

1. ✅ **Paystack payment integration** with callback URLs
2. ✅ **Automatic order status updates** after payment
3. ✅ **User redirects** to your frontend after payment
4. ✅ **Discount code system** (free orders bypass payment)
5. ✅ **Payment verification** endpoints
6. ✅ **Webhook support** for real-time updates

---

## 📦 Files Created/Updated

### New Controllers
- ✅ `controller/paymentController.ts` - Payment callbacks, webhooks, verification

### New Routes
- ✅ `routes/paymentRoutes.ts` - All payment-related endpoints

### New Services
- ✅ Updated `services/paystackService.ts` - Added callback URL & verification

### Updated Configuration
- ✅ `config/config.ts` - Added callback and frontend URLs

### Documentation
- ✅ `PAYMENT_FLOW.md` - Complete payment integration guide
- ✅ `PAYMENT_INTEGRATION_SUMMARY.md` - Technical overview
- ✅ `QUICK_START.md` - 5-minute setup guide
- ✅ `DISCOUNT_CODES_GUIDE.md` - Discount code reference
- ✅ `README.md` - Main documentation

---

## 🚀 How to Use

### 1. Create `.env` File

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/arkid

# Paystack (get from https://dashboard.paystack.com/settings/developer)
PAYSTACK_SECRET=sk_test_xxxxxxxxxxxxx
PAYSTACK_URL=https://api.paystack.co

# Callback URL (where Paystack redirects after payment)
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/callback

# Frontend URL (where users see success/failure pages)
FRONTEND_URL=http://localhost:3001

# Server
PORT=3000
```

### 2. Import Payment Routes in Your App

```typescript
// app.ts or index.ts
import paymentRoutes from "./routes/paymentRoutes";

app.use("/api/payments", paymentRoutes);
```

Or use the provided `app.example.ts` file.

### 3. Start Your Server

```bash
npx ts-node app.example.ts
```

---

## 🔄 Complete Payment Flow

### WITH Discount Code (Free Order)
```
1. User submits order with valid discount code
   ↓
2. Backend validates discount code
   ↓
3. Order created with status: "completed", amount: 0
   ↓
4. User receives confirmation immediately
```

### WITHOUT Discount Code (Payment Required)
```
1. User submits order (no discount code)
   ↓
2. Backend creates order with status: "pending"
   ↓
3. Backend initializes Paystack transaction
   ↓
4. User receives paymentUrl
   ↓
5. Frontend redirects user to paymentUrl
   ↓
6. User completes payment on Paystack
   ↓
7. Paystack redirects to: YOUR_BACKEND/api/payments/callback?reference=XXX
   ↓
8. Backend verifies payment with Paystack
   ↓
9. Backend updates order status to "completed"
   ↓
10. Backend redirects to: YOUR_FRONTEND/payment/success?reference=XXX
```

---

## 📱 Frontend Integration

### Step 1: Create Order

```javascript
async function createOrder(formData) {
  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      cardLink: formData.cardLink,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      currency: 'NGN',
      email: formData.email,
      discountCode: formData.discountCode // Optional
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    if (data.paymentUrl) {
      // Redirect to Paystack payment
      window.location.href = data.paymentUrl;
    } else {
      // Free order (discount applied)
      alert('Order completed successfully!');
    }
  }
}
```

### Step 2: Create Frontend Routes

You need these pages in your frontend:

**Success Page** (`/payment/success`)
```javascript
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
      <button onClick={() => window.location.href = '/'}>
        Back to Home
      </button>
    </div>
  );
}
```

**Failed Page** (`/payment/failed`)
```javascript
function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  
  return (
    <div>
      <h1>✗ Payment Failed</h1>
      <p>Your payment was not successful.</p>
      <p>Reference: {reference}</p>
      <button onClick={() => window.location.href = '/order'}>
        Try Again
      </button>
    </div>
  );
}
```

**Error Page** (`/payment/error`)
```javascript
function PaymentError() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  
  return (
    <div>
      <h1>⚠️ Error</h1>
      <p>{message || 'An error occurred processing your payment.'}</p>
      <button onClick={() => window.location.href = '/'}>
        Back to Home
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### 1. Test with Discount Code

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "cardLink": "https://test.com",
    "phone": "+2348012345678",
    "address": "Test Address",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "test@example.com",
    "discountCode": "TEST2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created with discount code",
  "data": {
    "status": "completed",
    "amount": 0,
    ...
  }
}
```

### 2. Test Payment Flow

```bash
# Same request without discountCode
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "cardLink": "https://test.com",
    "phone": "+2348012345678",
    "address": "Test Address",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction initialized. Please complete payment.",
  "data": {
    "order": { "status": "pending", ... },
    "reference": "ORD_1728492000000_abc123xyz"
  },
  "paymentUrl": "https://checkout.paystack.com/..."
}
```

### 3. Use Paystack Test Cards

**Successful Payment:**
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card: `4084080000000408`

---

## 📊 API Endpoints Reference

### Orders
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders` | POST | Create order |

### Payments
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/callback` | GET | Paystack callback (auto) |
| `/api/payments/webhook` | POST | Webhook (auto) |
| `/api/payments/verify/:ref` | GET | Verify payment (manual) |
| `/api/payments/status/:ref` | GET | Get order status |

### Discounts
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/discounts` | POST | Create single code |
| `/api/discounts/bulk` | POST | Create multiple codes |
| `/api/discounts` | GET | Get all codes |
| `/api/discounts/validate/:code` | GET | Validate code |

---

## 🔧 Configuration for Production

When deploying to production:

1. **Update environment variables:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/arkid
PAYSTACK_SECRET=sk_live_your_live_key
PAYSTACK_CALLBACK_URL=https://api.yourdomain.com/api/payments/callback
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

2. **Set up webhook on Paystack:**
   - Go to https://dashboard.paystack.com/settings/developer
   - Add webhook URL: `https://api.yourdomain.com/api/payments/webhook`

3. **Test thoroughly:**
   - Test with Paystack test mode first
   - Then switch to live keys

---

## 🎯 Key Features

✅ **Automatic Status Updates**
- Orders update from "pending" to "completed" automatically

✅ **Secure Payment Verification**
- Always verifies with Paystack before updating status

✅ **User-Friendly Redirects**
- Users redirected to appropriate success/failure pages

✅ **Discount Code Support**
- Free orders with valid discount codes
- Automatic validation and usage tracking

✅ **Webhook Backup**
- Double verification via webhook for reliability

✅ **Production Ready**
- Full error handling
- Comprehensive logging
- Security features

---

## 📚 Documentation

- 📖 [QUICK_START.md](./QUICK_START.md) - Get started in 5 minutes
- 📖 [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) - Detailed payment guide
- 📖 [PAYMENT_INTEGRATION_SUMMARY.md](./PAYMENT_INTEGRATION_SUMMARY.md) - Technical overview
- 📖 [DISCOUNT_CODES_GUIDE.md](./DISCOUNT_CODES_GUIDE.md) - Discount system reference
- 📖 [README.md](./README.md) - Complete API documentation

---

## 🆘 Troubleshooting

**Payment not redirecting?**
- Check `PAYSTACK_CALLBACK_URL` is correct and publicly accessible
- Verify `FRONTEND_URL` points to your frontend

**Status not updating?**
- Verify Paystack secret key is correct
- Check server logs for errors
- Test with `/api/payments/verify/:reference`

**Webhook not working?**
- Webhooks need public URL (use ngrok for local testing)
- Verify webhook URL in Paystack dashboard
- Check signature verification

---

## 🎉 You're All Set!

Your payment system is now complete with:
- ✅ Payment initialization with Paystack
- ✅ Automatic redirects after payment
- ✅ Status updates via callbacks
- ✅ Discount code support
- ✅ Complete error handling

**Start your server and test it out!**

```bash
npx ts-node app.example.ts
```

Then test with:
```bash
curl http://localhost:3000/health
```

Happy coding! 🚀

