# Frontend Integration Guide

This guide shows how to integrate your React frontend with the arkID API.

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Create Order
**POST** `/orders`

**Request Body:**
```json
{
  "name": "John Doe",
  "cardLink": "https://example.com/card",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "currency": "USD",
  "email": "john@example.com",
  "discountCode": "SAVE20" // Optional
}
```

**Response (with discount):**
```json
{
  "success": true,
  "message": "Order created with discount code",
  "data": {
    "_id": "order_id",
    "name": "John Doe",
    "amount": 0,
    "status": "completed",
    "reference": "DISC_1234567890"
  }
}
```

**Response (without discount):**
```json
{
  "success": true,
  "message": "Transaction initialized. Please complete payment.",
  "data": {
    "order": { /* order details */ },
    "reference": "ORD_1234567890_abc123"
  },
  "paymentUrl": "https://checkout.paystack.com/access_code_here"
}
```

### 2. Check Order Status
**GET** `/payments/status/:reference`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "order": { /* order details */ }
  }
}
```

### 3. Verify Discount Code
**POST** `/discounts/check`

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Discount code is valid"
}
```

### 4. Payment Callback (Internal)
**GET** `/payments/callback`

**Query Parameters:**
- `reference` - Transaction reference
- `trxref` - Alternative reference parameter

**Note:** This endpoint is called by Paystack after payment completion. It handles:
- Payment verification
- Order status updates
- Email notifications
- Redirects to frontend success/error pages

**Redirects:**
- **Success**: `{FRONTEND_URL}/payment/success?reference={ref}&order={orderId}`
- **Failed**: `{FRONTEND_URL}/payment/failed?reference={ref}`
- **Error**: `{FRONTEND_URL}/payment/error?message={error}`

## Integration Examples

### 1. Create Order with Discount
```javascript
const createOrderWithDiscount = async (orderData) => {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        discountCode: 'SAVE20'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.data.amount === 0) {
        // Discount applied, order completed
        console.log('Order completed with discount');
        return { success: true, order: result.data };
      } else {
        // Payment required
        window.location.href = result.paymentUrl;
      }
    }
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

### 2. Create Order with Payment
```javascript
const createOrderWithPayment = async (orderData) => {
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to Paystack payment
      window.location.href = result.paymentUrl;
    }
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

### 3. Check Order Status
```javascript
const checkOrderStatus = async (reference) => {
  try {
    const response = await fetch(`http://localhost:3000/api/payments/status/${reference}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.status;
    }
  } catch (error) {
    console.error('Error checking order status:', error);
  }
};
```

### 4. Verify Discount Code
```javascript
const verifyDiscountCode = async (code) => {
  try {
    const response = await fetch('http://localhost:3000/api/discounts/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Error verifying discount code:', error);
    return false;
  }
};
```

## Payment Flow Integration

### 1. Order Creation Flow
```javascript
const handleOrderSubmit = async (formData) => {
  // Check if discount code is provided
  if (formData.discountCode) {
    // Verify discount code first
    const isValid = await verifyDiscountCode(formData.discountCode);
    
    if (!isValid) {
      alert('Invalid discount code');
      return;
    }
  }
  
  // Create order
  const result = await createOrderWithDiscount(formData);
  
  if (result.success) {
    if (result.order.amount === 0) {
      // Discount applied, show success
      showSuccessMessage('Order completed with discount!');
    } else {
      // Payment required, redirect to Paystack
      window.location.href = result.paymentUrl;
    }
  }
};
```

### 2. Payment Callback Handling
After payment, users are redirected to:
- **Success**: `http://localhost:3001/payment/success?reference=ORD_123&order=order_id`
- **Failed**: `http://localhost:3001/payment/failed?reference=ORD_123`
- **Error**: `http://localhost:3001/payment/error?message=error_message`

**Important:** The callback route `/api/payments/callback` is handled by your backend API, not your frontend. It:
1. Verifies the payment with Paystack
2. Updates the order status in your database
3. Sends confirmation emails
4. Redirects the user to your frontend

Handle the redirects in your React router:
```javascript
// In your payment success page
const PaymentSuccess = () => {
  const { reference, order } = useParams();
  
  useEffect(() => {
    if (reference) {
      checkOrderStatus(reference).then(status => {
        if (status === 'completed') {
          // Show success message
        }
      });
    }
  }, [reference]);
  
  return <div>Payment successful!</div>;
};

// In your payment failed page
const PaymentFailed = () => {
  const { reference } = useParams();
  
  return (
    <div>
      <h1>Payment Failed</h1>
      <p>Reference: {reference}</p>
      <button onClick={() => window.location.href = '/'}>
        Try Again
      </button>
    </div>
  );
};

// In your payment error page
const PaymentError = () => {
  const { message } = useParams();
  
  return (
    <div>
      <h1>Payment Error</h1>
      <p>Error: {message}</p>
      <button onClick={() => window.location.href = '/'}>
        Go Home
      </button>
    </div>
  );
};
```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Error Handling Example
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data;
    console.error('API Error:', errorData.message);
    alert(errorData.message);
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.message);
    alert('Network error. Please check your connection.');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    alert('An unexpected error occurred.');
  }
};
```

## Environment Configuration

### Development
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Production
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

## Testing the Integration

### 1. Test Discount Code Flow
```javascript
// Test with valid discount code
const testDiscountOrder = {
  name: "Test User",
  cardLink: "https://example.com/card",
  phone: "+1234567890",
  address: "123 Test St",
  city: "Test City",
  state: "TS",
  currency: "USD",
  email: "test@example.com",
  discountCode: "SAVE20"
};

createOrderWithDiscount(testDiscountOrder);
```

### 2. Test Payment Flow
```javascript
// Test without discount code
const testPaymentOrder = {
  name: "Test User",
  cardLink: "https://example.com/card",
  phone: "+1234567890",
  address: "123 Test St",
  city: "Test City",
  state: "TS",
  currency: "USD",
  email: "test@example.com"
};

createOrderWithPayment(testPaymentOrder);
```

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Validate all inputs** before sending to API
3. **Handle errors gracefully** to prevent information leakage
4. **Use HTTPS** in production
5. **Implement rate limiting** on your frontend if needed

## CORS Configuration

Make sure your API allows requests from your frontend domain:

```javascript
// In your API (if using express)
app.use(cors({
  origin: ['http://localhost:3001', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

This integration guide provides everything you need to connect your React frontend to the arkID API without including actual React components.
