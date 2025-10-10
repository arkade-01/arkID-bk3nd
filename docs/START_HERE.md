# 🚀 START HERE - arkID Backend

Welcome to the arkID backend! Follow these steps to get started.

---

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory:

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
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### 4. Test the API
```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000
```

You should see:
```json
{
  "status": "OK",
  "message": "arkID Backend is running"
}
```

---

## 🎯 What Can This Backend Do?

### ✅ Order Management
- Create orders with customer details
- Process payments via Paystack
- Apply discount codes for free orders
- Automatic status updates

### ✅ Discount Codes
- Generate unique discount codes
- Bulk creation (up to 1000 codes)
- Usage limits and expiry dates
- Automatic validation

### ✅ Payment Processing
- Paystack integration
- Payment callbacks and redirects
- Webhook support
- Status verification

---

## 📋 Available NPM Scripts

```bash
npm run dev      # Start development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server (requires build first)
npm run prod     # Build and start production server
```

---

## 🌐 API Endpoints

Once the server is running, you can access:

### Orders
- `POST /api/orders` - Create new order

### Discounts
- `POST /api/discounts` - Create single discount code
- `POST /api/discounts/bulk` - Create multiple codes
- `GET /api/discounts` - Get all codes
- `GET /api/discounts/validate/:code` - Validate a code

### Payments
- `GET /api/payments/callback` - Payment callback (Paystack)
- `POST /api/payments/webhook` - Webhook handler
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/status/:reference` - Get order status

---

## 📚 Next Steps

### 1. Create Your First Discount Code
```bash
curl -X POST http://localhost:3000/api/discounts \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME2024",
    "description": "Welcome discount",
    "usageLimit": 100
  }'
```

### 2. Create an Order with Discount
```bash
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
    "discountCode": "WELCOME2024"
  }'
```

### 3. Test Payment Flow
```bash
# Create order without discount (requires payment)
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
    "email": "john@example.com"
  }'
```

The response will include a `paymentUrl` - open it in your browser to test payment.

---

## 🧪 Testing with Paystack Test Cards

### Successful Payment
- **Card Number:** `4084084084084081`
- **CVV:** `408`
- **Expiry:** Any future date
- **PIN:** `0000`
- **OTP:** `123456`

### Failed Payment
- **Card Number:** `4084080000000408`

---

## 📖 Full Documentation

For detailed information, check out:

- 📘 **[README.md](./README.md)** - Complete API documentation
- 📗 **[QUICK_START.md](./QUICK_START.md)** - Detailed setup guide
- 📙 **[PAYMENT_FLOW.md](./PAYMENT_FLOW.md)** - Payment integration
- 📕 **[ORDER_STATUS_FLOW.md](./ORDER_STATUS_FLOW.md)** - Order status explained
- 📔 **[DISCOUNT_CODES_GUIDE.md](./DISCOUNT_CODES_GUIDE.md)** - Discount system
- 📓 **[COMPLETE_SETUP.md](./COMPLETE_SETUP.md)** - Everything combined

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running: `mongod`
- Check your `MONGODB_URI` in `.env`

### "Paystack secret key error"
- Get your secret key from https://dashboard.paystack.com/settings/developer
- Use test key (starts with `sk_test_`) for development

### "Port already in use"
- Change `PORT` in `.env` to a different port
- Or kill the process using port 3000

### Server not starting?
```bash
# Check if there are TypeScript errors
npm run build

# Check if all dependencies are installed
npm install
```

---

## 🎉 You're Ready!

Your backend is now running and ready to:
- ✅ Accept orders
- ✅ Process payments via Paystack
- ✅ Validate discount codes
- ✅ Handle payment callbacks
- ✅ Update order statuses automatically

**Open your browser to:** http://localhost:3000

You should see the welcome message with all available endpoints!

---

## 💡 Pro Tips

1. **Use ngrok for webhook testing:**
   ```bash
   ngrok http 3000
   ```
   Then update `PAYSTACK_CALLBACK_URL` with the ngrok URL

2. **Monitor logs in development:**
   All requests are logged in development mode

3. **Check health endpoint:**
   Always available at `/health` to verify server is running

4. **Graceful shutdown:**
   Press `Ctrl+C` to stop the server cleanly

---

## 🆘 Need Help?

- Check the documentation files listed above
- Review the example files in `/utils/`
- Look at the route definitions in `/routes/`
- Examine controller logic in `/controller/`

---

**Happy coding! 🚀**

