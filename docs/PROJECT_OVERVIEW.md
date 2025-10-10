# 📦 arkID Backend - Complete Project Overview

A production-ready backend API for arkID card ordering system with Paystack payment integration, discount code management, and automatic order processing.

---

## 🎯 Project Structure

```
arkID-bk3nd/
│
├── index.ts                    # Main entry point ⭐ START HERE
├── app.example.ts              # Alternative app setup example
│
├── config/
│   └── config.ts               # Environment configuration
│
├── models/
│   ├── sales.ts                # Order/Sales schema
│   └── discount.ts             # Discount code schema
│
├── controller/
│   ├── orderController.ts      # Order creation logic
│   ├── discountController.ts   # Discount management
│   └── paymentController.ts    # Payment callbacks & verification
│
├── services/
│   ├── paystackService.ts      # Paystack API integration
│   ├── discountService.ts      # Discount code logic
│   └── orderStatusService.ts   # Order status management
│
├── routes/
│   ├── orderRoutes.ts          # Order endpoints
│   ├── discountRoutes.ts       # Discount endpoints
│   └── paymentRoutes.ts        # Payment endpoints
│
├── utils/
│   ├── createDiscountCode.ts   # Single code creation script
│   └── createBulkDiscountCodes.ts # Bulk code creation script
│
└── Documentation/
    ├── START_HERE.md           # 🚀 Quick start guide
    ├── QUICK_START.md          # 5-minute setup
    ├── README.md               # Full API documentation
    ├── PAYMENT_FLOW.md         # Payment integration guide
    ├── ORDER_STATUS_FLOW.md    # Order status explained
    ├── DISCOUNT_CODES_GUIDE.md # Discount system reference
    └── COMPLETE_SETUP.md       # Complete setup instructions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Paystack account (test or live)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see START_HERE.md)
cp .env.example .env  # Edit with your values

# 3. Start development server
npm run dev
```

**That's it!** Server will be running on http://localhost:3000

---

## ✨ Key Features

### 1. Order Management
- ✅ Create orders with complete customer details
- ✅ Automatic payment initialization with Paystack
- ✅ Order status tracking (pending → completed/failed)
- ✅ Support for both paid and free (discounted) orders

### 2. Discount Code System
- ✅ Generate unique 8-character codes (A-Z, 0-9)
- ✅ Bulk creation (up to 1000 codes at once)
- ✅ Usage limits and expiry dates
- ✅ Automatic validation and usage tracking
- ✅ Deactivate/activate codes
- ✅ 2.8 trillion possible unique codes

### 3. Payment Integration (Paystack)
- ✅ Secure payment initialization
- ✅ Automatic callback handling
- ✅ Payment verification
- ✅ Webhook support
- ✅ Automatic status updates
- ✅ User redirects to frontend

### 4. Security & Reliability
- ✅ Webhook signature verification
- ✅ Payment double-verification
- ✅ Unique reference generation
- ✅ Graceful error handling
- ✅ Environment-based configuration

---

## 📊 How It Works

### Order Flow

#### WITH Discount Code (Free)
```
User creates order with discount code
    ↓
Discount code validated
    ↓
Order status: "completed" (amount: 0)
    ↓
✅ Order complete immediately
```

#### WITHOUT Discount Code (Payment Required)
```
User creates order
    ↓
Order status: "pending"
    ↓
Paystack transaction initialized
    ↓
User redirected to Paystack payment page
    ↓
User completes payment
    ↓
Paystack redirects to callback URL
    ↓
Backend verifies payment
    ↓
Order status: "completed"
    ↓
User redirected to frontend success page
```

---

## 🌐 API Endpoints

### Base URL
`http://localhost:3000` (development)

### Health & Info
- `GET /` - API information
- `GET /health` - Health check

### Orders
- `POST /api/orders` - Create new order

### Discounts
- `POST /api/discounts` - Create single code
- `POST /api/discounts/bulk` - Create multiple codes
- `GET /api/discounts` - Get all codes
- `GET /api/discounts/validate/:code` - Validate code
- `PATCH /api/discounts/deactivate/:code` - Deactivate code

### Payments
- `GET /api/payments/callback` - Payment callback
- `POST /api/payments/webhook` - Webhook handler
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/status/:reference` - Get order status

---

## 🛠️ NPM Scripts

```bash
npm run dev      # Development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Production server (requires build)
npm run prod     # Build and start production
```

---

## 📝 Environment Variables

Required in `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/arkid

# Paystack
PAYSTACK_SECRET=sk_test_xxxxx
PAYSTACK_URL=https://api.paystack.co

# URLs
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/callback
FRONTEND_URL=http://localhost:3001

# Server
PORT=3000
NODE_ENV=development
```

---

## 🧪 Testing

### Quick Test
```bash
# Health check
curl http://localhost:3000/health

# Create discount code
curl -X POST http://localhost:3000/api/discounts \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST2024", "usageLimit": 10}'

# Create order with discount
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "cardLink": "https://test.com",
    "phone": "+2348012345678",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "currency": "NGN",
    "email": "test@example.com",
    "discountCode": "TEST2024"
  }'
```

### Paystack Test Cards
- **Success:** `4084084084084081` (CVV: 408, PIN: 0000, OTP: 123456)
- **Failure:** `4084080000000408`

---

## 📚 Documentation Guide

### For Different Scenarios:

**Just getting started?**
→ Read [START_HERE.md](./START_HERE.md)

**Need quick setup?**
→ Read [QUICK_START.md](./QUICK_START.md)

**Integrating payments?**
→ Read [PAYMENT_FLOW.md](./PAYMENT_FLOW.md)

**Understanding order status?**
→ Read [ORDER_STATUS_FLOW.md](./ORDER_STATUS_FLOW.md)

**Working with discounts?**
→ Read [DISCOUNT_CODES_GUIDE.md](./DISCOUNT_CODES_GUIDE.md)

**Complete reference?**
→ Read [README.md](./README.md)

**Everything combined?**
→ Read [COMPLETE_SETUP.md](./COMPLETE_SETUP.md)

---

## 🎯 Common Tasks

### Generate 100 Discount Codes
```bash
curl -X POST http://localhost:3000/api/discounts/bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 100, "usageLimit": 1}'
```

### Check Payment Status
```bash
curl http://localhost:3000/api/payments/status/ORD_xxx
```

### Verify Payment
```bash
curl http://localhost:3000/api/payments/verify/ORD_xxx
```

### Get All Discounts
```bash
curl http://localhost:3000/api/discounts
```

---

## 🏗️ Architecture Highlights

### Design Patterns
- **MVC Pattern** - Organized into Models, Controllers, Routes
- **Service Layer** - Business logic separated from controllers
- **Middleware** - Express middleware for request processing
- **Environment Config** - Centralized configuration management

### Technology Stack
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Payment:** Paystack REST API
- **Validation:** Built-in validation logic
- **Logging:** Console-based logging

### Code Organization
- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and external API calls
- **Models** - Database schemas and validation
- **Routes** - API endpoint definitions
- **Config** - Environment and app configuration

---

## 🚀 Deployment

### For Production:

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   PAYSTACK_SECRET=sk_live_xxx
   PAYSTACK_CALLBACK_URL=https://api.yourdomain.com/api/payments/callback
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Build the Project:**
   ```bash
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

4. **Set up Paystack Webhook:**
   - Go to Paystack Dashboard
   - Settings → Webhooks
   - Add: `https://api.yourdomain.com/api/payments/webhook`

---

## 🔧 Maintenance

### Database Cleanup
```typescript
// Expire old pending orders (run daily)
import { expirePendingOrders } from './services/orderStatusService';
await expirePendingOrders(24); // 24 hours
```

### Monitoring
- Check `/health` endpoint regularly
- Monitor MongoDB connection
- Review Paystack dashboard for transactions
- Check server logs for errors

---

## 📊 Statistics

- **Total Files:** 20+ TypeScript files
- **API Endpoints:** 12+ endpoints
- **Documentation:** 8 comprehensive guides
- **Possible Discount Codes:** 2.8 trillion unique combinations
- **Max Bulk Creation:** 1000 codes per request
- **Payment Provider:** Paystack (supports 150+ countries)

---

## 🎓 Learning Resources

### Understanding the Codebase
1. Start with `index.ts` - Main entry point
2. Check `routes/` - See all available endpoints
3. Read `controller/` - Understand request handling
4. Review `services/` - Business logic
5. Examine `models/` - Database schemas

### Key Concepts
- **RESTful API Design**
- **Payment Gateway Integration**
- **Database Modeling with Mongoose**
- **TypeScript with Express**
- **Async/Await Error Handling**
- **Environment-based Configuration**

---

## 🆘 Troubleshooting

### Server won't start?
- Check MongoDB is running
- Verify environment variables
- Run `npm install` again
- Check for port conflicts

### Payment not working?
- Verify Paystack secret key
- Check callback URL is accessible
- Review Paystack dashboard
- Check server logs

### Discount codes not validating?
- Ensure code exists in database
- Check if code is active
- Verify not expired
- Check usage limit not reached

---

## 🎉 What's Included

✅ Complete order processing system
✅ Paystack payment integration
✅ Discount code management (single & bulk)
✅ Payment callbacks and webhooks
✅ Automatic status updates
✅ User redirects after payment
✅ Order status verification
✅ Security features (signature verification)
✅ Error handling and logging
✅ TypeScript types throughout
✅ Comprehensive documentation
✅ Testing utilities
✅ Production-ready setup
✅ Graceful shutdown handling

---

## 📞 Support & Resources

- **Paystack Docs:** https://paystack.com/docs/
- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Docs:** https://expressjs.com/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

## 🏆 Project Status

✅ **PRODUCTION READY**

This backend is fully functional and ready for production deployment with:
- Complete payment processing
- Discount code system
- Comprehensive error handling
- Security best practices
- Full documentation

---

**Built with ❤️ for arkID**

*Version 1.0.0*

