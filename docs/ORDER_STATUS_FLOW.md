# Order Status Flow Explained

## 📊 Order Status Values

Your system now supports these status values:

| Status | Meaning |
|--------|---------|
| `pending` | Payment not completed yet (user hasn't paid or is still paying) |
| `completed` | Payment successful OR discount code applied |
| `failed` | Payment failed or was cancelled |
| `expired` | Payment was abandoned (optional - for old pending orders) |

---

## 🔄 Complete Status Flow

### Scenario 1: Order WITH Discount Code ✅
```
Order Created
   ↓
Status: "completed"
Amount: 0
   ↓
✅ DONE - No payment needed
```

**Timeline:** Instant

---

### Scenario 2: Order WITHOUT Discount - Successful Payment ✅

```
Order Created
   ↓
Status: "pending" ⏳
   ↓
User redirected to Paystack
   ↓
Status: STILL "pending" ⏳ (while user is on Paystack page)
   ↓
User completes payment
   ↓
Paystack redirects to: /api/payments/callback
   ↓
Backend verifies with Paystack
   ↓
Status: "completed" ✅
   ↓
User redirected to: /payment/success
```

**Timeline:** 30 seconds - 5 minutes

---

### Scenario 3: Order WITHOUT Discount - Failed Payment ❌

```
Order Created
   ↓
Status: "pending" ⏳
   ↓
User redirected to Paystack
   ↓
Status: STILL "pending" ⏳
   ↓
User's payment fails OR user cancels
   ↓
Paystack redirects to: /api/payments/callback
   ↓
Backend verifies with Paystack
   ↓
Status: "failed" ❌
   ↓
User redirected to: /payment/failed
```

**Timeline:** 30 seconds - 5 minutes

---

### Scenario 4: Abandoned Payment ⚠️

```
Order Created
   ↓
Status: "pending" ⏳
   ↓
User redirected to Paystack
   ↓
Status: STILL "pending" ⏳
   ↓
User closes browser / navigates away
   ↓
NO REDIRECT HAPPENS ⚠️
   ↓
Status: REMAINS "pending" ⏳
```

**What happens:**
- Order stays as `"pending"` in database
- No callback is triggered
- You need to handle this manually or automatically

---

## 🛠️ Handling Abandoned Payments

I've created helper functions to handle abandoned payments:

### Option 1: Check Status Dynamically

The `/api/payments/status/:reference` endpoint now automatically checks with Paystack if order is pending:

```javascript
// Frontend polling
async function pollOrderStatus(reference) {
  const response = await fetch(`/api/payments/status/${reference}`);
  const data = await response.json();
  
  // Status will be updated if payment completed on Paystack
  return data.data.status;
}

// Poll every 5 seconds
const interval = setInterval(async () => {
  const status = await pollOrderStatus(reference);
  
  if (status === 'completed') {
    clearInterval(interval);
    // Show success
  } else if (status === 'failed') {
    clearInterval(interval);
    // Show failure
  }
  // Keep polling if still pending
}, 5000);
```

### Option 2: Expire Old Pending Orders

Use the `expirePendingOrders()` function to automatically expire old orders:

```typescript
import { expirePendingOrders } from './services/orderStatusService';

// Expire orders older than 24 hours
const result = await expirePendingOrders(24);
console.log(`Expired ${result.expiredCount} old orders`);
```

Run this periodically (e.g., via cron job):

```javascript
// Run every hour
setInterval(async () => {
  await expirePendingOrders(24);
}, 60 * 60 * 1000);
```

### Option 3: Get Pending Orders

Find orders that might be abandoned:

```typescript
import { getPendingOrders } from './services/orderStatusService';

// Get orders pending for more than 30 minutes
const abandonedOrders = await getPendingOrders(30);

console.log(`Found ${abandonedOrders.length} potentially abandoned orders`);
```

---

## 🎯 Key Points

### When Status Changes:

✅ **"pending" → "completed"**
- Happens AFTER Paystack redirect to callback
- AFTER payment verification succeeds
- NOT while user is still on Paystack page

✅ **"pending" → "failed"**  
- Happens AFTER Paystack redirect to callback
- AFTER payment verification shows failure
- NOT immediately when payment fails

❌ **If no redirect happens (user closes browser):**
- Status STAYS "pending"
- You need to handle this separately
- Options: polling, expiring old orders, or manual check

---

## 📱 Frontend Best Practices

### 1. Show Loading State

```javascript
async function createOrder(data) {
  // Create order
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.paymentUrl) {
    // Save reference before redirect
    localStorage.setItem('pendingPayment', result.data.reference);
    
    // Redirect to payment
    window.location.href = result.paymentUrl;
  }
}
```

### 2. Check Status After User Returns

```javascript
// On your payment success/failure pages
useEffect(() => {
  const pendingRef = localStorage.getItem('pendingPayment');
  
  if (pendingRef) {
    // Check final status
    checkOrderStatus(pendingRef).then(status => {
      localStorage.removeItem('pendingPayment');
      
      if (status === 'completed') {
        // Show success
      } else if (status === 'failed') {
        // Show failure
      } else {
        // Still pending - keep checking
        startPolling(pendingRef);
      }
    });
  }
}, []);
```

### 3. Handle User Returning Without Completing Payment

```javascript
// On your homepage or order page
useEffect(() => {
  const pendingRef = localStorage.getItem('pendingPayment');
  
  if (pendingRef) {
    // User left without completing payment
    showAlert('You have a pending payment. Would you like to complete it?');
  }
}, []);
```

---

## 🔔 Webhook vs Callback

### Callback (Redirect) - Always happens if user completes/cancels payment
- User completes payment → Paystack redirects → Callback updates status
- **Reliability:** High (if user completes flow)
- **Issue:** Won't trigger if user abandons

### Webhook - Paystack servers call your endpoint
- Paystack servers notify you of payment events
- **Reliability:** Very high (independent of user)
- **Requirement:** Public URL (won't work with localhost)

**Recommendation:** Use both for maximum reliability!

---

## 🧪 Testing Different Scenarios

### Test Successful Payment
1. Create order without discount code
2. Complete payment with test card: `4084084084084081`
3. Check status → Should be "completed"

### Test Failed Payment
1. Create order without discount code
2. Use failed test card: `4084080000000408`
3. Check status → Should be "failed"

### Test Abandoned Payment
1. Create order without discount code
2. Open payment page but close browser
3. Check status → Will be "pending"
4. Use `/api/payments/status/:reference` to check
5. Status will update if payment was completed on Paystack

---

## 📊 Status Summary Table

| Scenario | Initial Status | Final Status | When Updated |
|----------|---------------|--------------|--------------|
| Discount code used | - | `completed` | Immediately |
| Payment successful | `pending` | `completed` | After redirect + verification |
| Payment failed | `pending` | `failed` | After redirect + verification |
| Payment abandoned | `pending` | `pending` | Never (unless manually checked) |
| Old pending order | `pending` | `expired` | Via cron job (optional) |

---

## 💡 Recommendations

1. **Implement polling** on frontend for pending orders
2. **Run cron job** to expire old pending orders (24h+)
3. **Use webhooks** in production for reliability
4. **Show clear UI** to users about pending payments
5. **Allow retry** for failed/abandoned payments

---

## 🔗 Related Files

- `/services/orderStatusService.ts` - Helper functions for pending orders
- `/controller/paymentController.ts` - Payment callback & verification
- `/services/paystackService.ts` - Paystack integration

---

**The key takeaway:** Status changes happen AFTER the redirect/callback, not during payment. If there's no redirect (abandoned), status stays "pending" until manually checked.

