# Discount Codes Quick Reference Guide

## 🎯 Quick Start

### Generate Multiple Codes (Recommended)

**Via API:**
```bash
curl -X POST http://localhost:3000/api/discounts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "description": "Launch promo codes",
    "usageLimit": 1,
    "expiryDate": "2024-12-31T23:59:59Z"
  }'
```

**Via Script:**
```bash
npx ts-node utils/createBulkDiscountCodes.ts
```

---

## 📊 How Many Codes?

### `generateDiscountCode()` function:
- Generates **1 code** per call
- 8 characters long (A-Z, 0-9)
- Example: `A7B9C3D1`

### `createMultipleDiscountCodes()` function:
- Generates **up to 1000 codes** per call
- All unique and validated
- Same settings applied to all codes in batch

### Maximum Capacity:
- **Total possible unique codes**: 36^8 = **2.8 trillion codes**
- You'll never run out! 🎉

---

## 🚀 Usage Examples

### Example 1: 100 One-Time Use Codes
```javascript
// Via API
POST /api/discounts/bulk
{
  "count": 100,
  "description": "One-time use promo",
  "usageLimit": 1
}
```

### Example 2: 50 VIP Codes (Unlimited Use)
```javascript
POST /api/discounts/bulk
{
  "count": 50,
  "description": "VIP unlimited access",
  "usageLimit": null
}
```

### Example 3: 200 Limited-Time Codes
```javascript
POST /api/discounts/bulk
{
  "count": 200,
  "description": "Black Friday 2024",
  "usageLimit": 5,
  "expiryDate": "2024-11-30T23:59:59Z"
}
```

---

## 📝 Response Format

```json
{
  "success": true,
  "message": "Successfully created 100 discount codes",
  "data": {
    "success": true,
    "created": 100,
    "failed": 0,
    "codes": [
      {
        "code": "A7B9C3D1",
        "description": "Launch promo codes",
        "isActive": true,
        "usageLimit": 1,
        "usedCount": 0,
        "expiryDate": "2024-12-31T23:59:59.000Z",
        "createdAt": "2024-10-09T12:00:00.000Z"
      },
      // ... 99 more codes
    ],
    "errors": []
  }
}
```

---

## 🔍 Export Codes to CSV

You can easily export all generated codes:

```bash
# Get all codes and save to file
curl http://localhost:3000/api/discounts | jq -r '.data[] | .code' > discount_codes.txt

# Or with details
curl http://localhost:3000/api/discounts | jq -r '.data[] | "\(.code),\(.usageLimit),\(.usedCount)"' > discount_codes.csv
```

---

## ⚙️ Configuration Limits

| Setting | Value | Note |
|---------|-------|------|
| Max codes per request | 1000 | Safety limit |
| Code length | 8 chars | A-Z, 0-9 |
| Uniqueness attempts | 20 | Per code |
| Total possible codes | 2.8 trillion | Essentially unlimited |

---

## 💡 Best Practices

1. **Batch Creation**: Use bulk endpoint for multiple codes
2. **Set Usage Limits**: Prevent abuse with `usageLimit`
3. **Add Expiry Dates**: Clean up old campaigns automatically
4. **Track Usage**: Monitor `usedCount` to see popularity
5. **Deactivate, Don't Delete**: Keep history by deactivating old codes

---

## 🛠️ Troubleshooting

### "Failed to generate unique code after 20 attempts"
- Extremely rare (less than 1 in 2.8 trillion chance)
- Script will retry and report in `errors` array
- Only happens if database has billions of codes already

### Slow bulk creation?
- Creating 1000 codes takes ~10-30 seconds (database dependent)
- Consider creating in smaller batches (100-200 at a time)

---

## 📞 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/discounts` | POST | Create 1 code |
| `/api/discounts/bulk` | POST | Create multiple codes |
| `/api/discounts` | GET | Get all codes |
| `/api/discounts/validate/:code` | GET | Check if code is valid |
| `/api/discounts/deactivate/:code` | PATCH | Deactivate a code |

