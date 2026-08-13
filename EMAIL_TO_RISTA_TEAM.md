# Email to Rista Team

---

**Subject:** ✅ Webhook Endpoint Details - Ready for Testing

---

Hi Rista Team,

Thank you for configuring the webhook and API for our website integration. We're ready to proceed with testing on the **Head Office outlet**.

## 🔌 Webhook Endpoint Information

Please confirm you have configured the following details on your end:

### Status Callback Endpoint
```
URL: https://mycoffeeco-middleware-original.onrender.com/api/orders/callback
Method: POST
Content-Type: application/json
```

### Required Header
```
x-rista-secret: mcc-rista-callback-2026
```

### Expected Statuses
Please send callbacks for these order status changes:
- ✅ Accepted
- 🔪 Prepared / In Progress
- 📦 Ready for Pickup
- 🚚 Dispatched
- ✅ Completed
- ❌ Rejected / Cancelled

### Sample Payload Format
```json
{
  "invoiceNumber": "1025",
  "saleId": "6a1234567890abcdef123456",
  "status": "Accepted",
  "fulfillmentStatus": "Accepted",
  "updatedAt": "2026-08-13T10:35:00+05:30",
  "branchCode": "HO",
  "channel": "Delivery"
}
```

---

## 🧪 Test Configuration

**Test Outlet:** Head Office  
**Branch Code:** `HO`  
**Channel:** `Delivery`  
**API Credentials:** Already configured (API Key: `1a642e06...`)

---

## 📋 Testing Plan

We will perform the following tests over the next 24-48 hours:

### Phase 1: Basic Order Flow ✅
1. Place a simple order (1 item) from Shopify
2. Verify order appears in Rista POS Head Office outlet
3. Accept order in POS
4. Verify our system receives "Accepted" callback

### Phase 2: Advanced Scenarios ✅
1. Multi-item orders with variants (Regular, Large, Extra Large)
2. Customer information sync
3. Cash on Delivery vs Online Payment mapping
4. Status updates through complete order lifecycle

### Phase 3: Error Handling ✅
1. Invalid SKU handling
2. Sold-out items
3. Customer phone validation
4. Duplicate order prevention

---

## ✅ Confirmation Request

Please confirm the following:

- [ ] ✅ Webhook URL configured: `https://mycoffeeco-middleware-original.onrender.com/api/orders/callback`
- [ ] ✅ Header configured: `x-rista-secret: mcc-rista-callback-2026`
- [ ] ✅ Head Office outlet mapped for testing
- [ ] ✅ Channel set to "Delivery"
- [ ] ✅ API credentials active and working
- [ ] ✅ Callbacks will be sent for all status changes

---

## 🚀 Next Steps

1. **You confirm** webhook configuration above ✅
2. **We place** test orders from Shopify 🛒
3. **You verify** orders appear in Head Office POS 📱
4. **You accept** orders in POS ✅
5. **We verify** callbacks received 📞
6. **Both teams review** results together 📊

---

## 📞 Contact Information

**For Testing Coordination:**
- Email: [Your email]
- Phone: [Your phone]
- Available: [Your timezone/hours]

**For Technical Issues:**
- Middleware logs available in real-time
- Can provide detailed error traces if needed

---

## 🕐 Timeline

**Target Start:** Immediately upon your confirmation  
**Expected Duration:** 1-2 days for comprehensive testing  
**Go-Live Target:** After successful test completion

---

We're excited to complete this integration and bring online ordering to our customers! Please reply with confirmation when you're ready for us to begin testing.

Best regards,  
**My Coffee Co Team**

---

### Quick Test Links (For Your Reference)

**Menu API Test:**
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Delivery
```

**Callback Test (You can test connectivity):**
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders/callback \
  -H "Content-Type: application/json" \
  -H "x-rista-secret: mcc-rista-callback-2026" \
  -d '{"invoiceNumber":"TEST-001","status":"Accepted"}'
```

Expected response: `200 OK`

---

_This email contains all technical details needed for integration testing. Please reach out if you need any clarification._
