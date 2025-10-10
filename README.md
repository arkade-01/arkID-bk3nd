# arkID Backend

Backend API for arkID card ordering system with Paystack integration.

## 📚 Documentation

All documentation has been organized in the [`docs/`](./docs/) folder:

- 🚀 **[START_HERE.md](./docs/START_HERE.md)** - Quick start guide (5 minutes)
- 📋 **[QUICK_START.md](./docs/QUICK_START.md)** - Detailed setup instructions
- 📦 **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** - Complete project documentation
- 💳 **[PAYMENT_FLOW.md](./docs/PAYMENT_FLOW.md)** - Payment integration guide
- 📊 **[ORDER_STATUS_FLOW.md](./docs/ORDER_STATUS_FLOW.md)** - Order status explained
- 🎫 **[DISCOUNT_CODES_GUIDE.md](./docs/DISCOUNT_CODES_GUIDE.md)** - Discount system reference
- 📧 **[EMAIL_USAGE_GUIDE.md](./docs/EMAIL_USAGE_GUIDE.md)** - Email templates guide
- 🔗 **[EMAIL_CALLBACK_INTEGRATION.md](./docs/EMAIL_CALLBACK_INTEGRATION.md)** - Email + callback integration
- 🎯 **[COMPLETE_SETUP.md](./docs/COMPLETE_SETUP.md)** - Everything combined

---

## Features

- **Order Management**: Create orders with customer details
- **Discount Code System**: Unique discount codes with validation
- **Payment Integration**: Paystack payment gateway integration
- **MongoDB Database**: Store orders and discount codes

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/arkid
PAYSTACK_SECRET=your_paystack_secret_key
PAYSTACK_URL=https://api.paystack.co
```

3. Install development dependencies:
```bash
npm install --save-dev @types/node ts-node typescript
```

## API Endpoints

### Orders

#### Create Order
`POST /api/orders`

**Request Body:**
```json
{
  "name": "John Doe",
  "cardLink": "https://myprofile.com/johndoe",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos",
  "currency": "NGN",
  "email": "john@example.com",
  "discountCode": "WELCOME2024" // Optional
}
```

**Response (with discount code):**
```json
{
  "success": true,
  "message": "Order created with discount code",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "amount": 0,
    "status": "completed",
    ...
  }
}
```

**Response (without discount code):**
```json
{
  "success": true,
  "message": "Transaction initialized",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "amount": 10000,
    "status": "pending",
    ...
  },
  "paymentUrl": "https://checkout.paystack.com/..."
}
```

### Discount Codes

#### Create Single Discount Code
`POST /api/discounts`

**Request Body:**
```json
{
  "code": "WELCOME2024", // Optional, auto-generated if not provided
  "description": "Welcome discount for new users",
  "usageLimit": 100, // Optional, null for unlimited
  "expiryDate": "2024-12-31T23:59:59Z" // Optional, null for no expiry
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount code created successfully",
  "data": {
    "code": "WELCOME2024",
    "description": "Welcome discount for new users",
    "isActive": true,
    "usageLimit": 100,
    "usedCount": 0,
    "expiryDate": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-10-09T12:00:00.000Z"
  }
}
```

#### Create Multiple Discount Codes (Bulk)
`POST /api/discounts/bulk`

**Request Body:**
```json
{
  "count": 50, // Number of codes to generate (max 1000)
  "description": "Promotional codes - Batch 1",
  "usageLimit": 100, // Optional, null for unlimited
  "expiryDate": "2024-12-31T23:59:59Z" // Optional, null for no expiry
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully created 50 discount codes",
  "data": {
    "success": true,
    "created": 50,
    "failed": 0,
    "codes": [
      {
        "code": "A7B9C3D1",
        "description": "Promotional codes - Batch 1",
        "isActive": true,
        "usageLimit": 100,
        "usedCount": 0,
        ...
      },
      // ... 49 more codes
    ],
    "errors": []
  }
}
```

#### Get All Discount Codes
`GET /api/discounts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "WELCOME2024",
      "description": "Welcome discount",
      "isActive": true,
      "usageLimit": 100,
      "usedCount": 25,
      ...
    }
  ]
}
```

#### Validate Discount Code
`GET /api/discounts/validate/:code`

**Response (valid):**
```json
{
  "success": true,
  "message": "Discount code is valid",
  "data": {
    "code": "WELCOME2024",
    "isActive": true,
    "usageLimit": 100,
    "usedCount": 25,
    ...
  }
}
```

**Response (invalid):**
```json
{
  "success": false,
  "message": "Discount code has expired",
  "data": null
}
```

#### Deactivate Discount Code
`PATCH /api/discounts/deactivate/:code`

**Response:**
```json
{
  "success": true,
  "message": "Discount code deactivated successfully",
  "data": {
    "code": "WELCOME2024",
    "isActive": false,
    ...
  }
}
```

## Creating Discount Codes

### Option 1: Using the API (Single Code)
Make a POST request to `/api/discounts` with the discount code details:
```bash
curl -X POST http://localhost:3000/api/discounts \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME2024", "description": "Welcome discount", "usageLimit": 100}'
```

### Option 2: Using the API (Multiple Codes - Bulk)
Make a POST request to `/api/discounts/bulk` to generate multiple codes at once:
```bash
curl -X POST http://localhost:3000/api/discounts/bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "description": "Promo batch 1", "usageLimit": 100}'
```

**Features:**
- Generate up to **1000 codes** in a single request
- All codes are guaranteed to be unique
- Same settings (description, usage limit, expiry) applied to all codes

### Option 3: Using the Utility Script (Single Code)
Run the utility script to create sample discount codes:
```bash
npx ts-node utils/createDiscountCode.ts
```

### Option 4: Using the Bulk Utility Script
Run the bulk utility script to create multiple codes:
```bash
npx ts-node utils/createBulkDiscountCodes.ts
```

Edit the scripts to customize your discount codes.

## Discount Code Features

- **Unique Codes**: Each discount code is unique and stored in uppercase
- **Auto-Generation**: Codes can be auto-generated or manually specified
- **Usage Limits**: Set maximum number of times a code can be used
- **Expiry Dates**: Set when a discount code expires
- **Active/Inactive**: Ability to deactivate codes without deleting them
- **Usage Tracking**: Track how many times each code has been used
- **Validation**: Automatic validation checks:
  - Code exists
  - Code is active
  - Not expired
  - Usage limit not reached

## Database Models

### Sales
- name, cardLink, phone, address, city, state, country
- email, currency, amount, discount
- transactionId, reference, status
- createdAt

### Discount
- code (unique, uppercase)
- description
- isActive
- usageLimit (null = unlimited)
- usedCount
- expiryDate (null = no expiry)
- createdAt, updatedAt

## Development

```bash
# Compile TypeScript
npx tsc

# Run in development mode with nodemon
npm run dev
```

## Notes

- The base amount for orders without discount codes is set to 10,000 (₦10,000) in `orderController.ts` line 61
- Discount codes are automatically converted to uppercase
- When a valid discount code is used, the order amount is set to 0 and status is "completed"
- When no discount code is used, Paystack transaction is initialized and order status is "pending"

