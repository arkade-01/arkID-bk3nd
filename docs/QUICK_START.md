# Quick Start Guide

## 🚀 Setup in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/arkid

# Paystack (get from https://dashboard.paystack.com/settings/developer)
PAYSTACK_SECRET=sk_test_your_secret_key_here
PAYSTACK_URL=https://api.paystack.co

# Callback & Frontend URLs
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/callback
FRONTEND_URL=http://localhost:3001

# Server
PORT=3000
```

### 3. Start Server
```bash
# Using the example app
npx ts-node app.example.ts

# Or your own app.ts
npx ts-node app.ts
```

### 4. Test the API
```bash
# Health check
curl http://localhost:3000/health

# Create a discount code
curl -X POST http://localhost:3000/api/discounts \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST2024", "description": "Test code", "usageLimit": 10}'

# Create order with discount
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "cardLink": "https://mycard.com/john",
    "phone": "+2348012345678",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "john@example.com",
    "discountCode": "TEST2024"
  }'
```

## 📋 Available Endpoints

### Orders
- `POST /api/orders` - Create order (with or without discount)

### Discounts
- `POST /api/discounts` - Create single discount code
- `POST /api/discounts/bulk` - Create multiple codes (up to 1000)
- `GET /api/discounts` - Get all codes
- `GET /api/discounts/validate/:code` - Validate a code
- `PATCH /api/discounts/deactivate/:code` - Deactivate a code

### Payments
- `GET /api/payments/callback` - Payment callback (Paystack redirects here)
- `POST /api/payments/webhook` - Webhook (Paystack servers call this)
- `GET /api/payments/verify/:reference` - Manually verify payment
- `GET /api/payments/status/:reference` - Get order status

## 🎯 Common Tasks

### Generate 100 Discount Codes
```bash
curl -X POST http://localhost:3000/api/discounts/bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 100, "description": "Promo batch", "usageLimit": 1}'
```

### Check Payment Status
```bash
curl http://localhost:3000/api/payments/status/ORD_1728492000000_abc123xyz
```

### Validate Discount Before Use
```bash
curl http://localhost:3000/api/discounts/validate/TEST2024
```

## 📖 Full Documentation

- [README.md](./README.md) - Complete API documentation
- [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) - Payment integration guide
- [DISCOUNT_CODES_GUIDE.md](./DISCOUNT_CODES_GUIDE.md) - Discount code reference

## 🧪 Testing with Paystack

Use these test cards in Paystack test mode:

**Success:**
- Card: `4084084084084081`
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

**Failure:**
- Card: `4084080000000408`

## ⚠️ Important Notes

1. **Discount codes bypass payment** - Orders with valid discount codes are automatically marked as "completed" with amount: 0
2. **Orders without discount require payment** - User must complete Paystack payment
3. **Payment status updates automatically** - When user completes payment or callback is received
4. **Webhooks need public URL** - Use ngrok for local testing or rely on callback URL

## 🔧 Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

**Paystack errors?**
- Verify PAYSTACK_SECRET is correct
- Make sure you're using test key (starts with `sk_test_`)

**Payment not redirecting?**
- Check PAYSTACK_CALLBACK_URL is publicly accessible
- Verify FRONTEND_URL points to your frontend

## 🎉 You're Ready!

Your backend is now configured to:
- ✅ Create orders with customer details
- ✅ Generate and validate unique discount codes
- ✅ Process payments via Paystack
- ✅ Handle payment callbacks and redirects
- ✅ Update order status automatically

