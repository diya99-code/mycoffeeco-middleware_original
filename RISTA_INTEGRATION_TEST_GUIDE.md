# Rista Integration - Testing Guide

## 📋 Integration Summary

### System Architecture
```
Shopify Store (mycoffeeco.myshopify.com)
    ↓ (Order webhook)
Middleware API (mycoffeeco-middleware-original.onrender.com)
    ↓ (Create sale API)
Rista POS System
    ↓ (Status callback webhook)
Middleware API (logs status updates)
```

---

## 🔑 Integration Endpoints

### 1. Order Creation (Shopify → Rista)
**Endpoint:** `POST https://mycoffeeco-middleware-original.onrender.com/api/orders`
- **Trigger:** Shopify sends order webhook after customer checkout
- **Action:** Middleware transforms Shopify order → Rista sale format
- **Result:** Order appears in Rista POS for "Head Office" outlet

### 2. Status Updates (Rista → Middleware)
**Endpoint:** `POST https://mycoffeeco-middleware-original.onrender.com/api/orders/callback`
- **Required Header:** `x-rista-secret: mcc-rista-callback-2026`
- **Trigger:** Rista POS sends updates when order status changes
- **Statuses:** Accepted, Prepared, Ready, Dispatched, Completed, Rejected
- **Action:** Middleware logs the status (can be extended to update Shopify)

### 3. Customer Sync (Shopify → Rista)
**Endpoints:**
- `POST https://mycoffeeco-middleware-original.onrender.com/api/customers/webhook/create`
- `POST https://mycoffeeco-middleware-original.onrender.com/api/customers/webhook/update`
- **Required Header:** `X-Shopify-Hmac-SHA256: <signature>`
- **Action:** Creates/updates customer in Rista for loyalty tracking

---

## 🧪 Test Configuration

### Test Outlet
- **Outlet Name:** Head Office
- **Branch Code:** `HO`
- **Channel:** `Delivery` (as configured by Rista team)

### Middleware Configuration
```bash
RISTA_BASE_URL=https://api.ristaapps.com/v1
RISTA_API_KEY=1a642e06-b280-4e22-8e3b-b08edf431a5c
RISTA_SECRET_KEY=tnxWpKSXF_LuzmGeX9i-sh60YegyRHpgfIazHtJuZ88
RISTA_CALLBACK_SECRET=mcc-rista-callback-2026
RISTA_BRANCH_CODE=HO
SHOPIFY_RISTA_CHANNEL=Delivery
```

---

## 📝 Testing Checklist

### Pre-Test Verification

#### ✅ 1. Middleware Server is Running
- [ ] Server deployed on Render: https://mycoffeeco-middleware-original.onrender.com
- [ ] Health check returns 200: `GET /`
- [ ] Environment variables configured correctly

#### ✅ 2. Shopify Webhooks Configured
- [ ] Order creation webhook: `POST /api/shopify/orders/create`
- [ ] Customer create webhook: `POST /api/customers/webhook/create`
- [ ] Customer update webhook: `POST /api/customers/webhook/update`

#### ✅ 3. Rista Configuration Confirmed
- [ ] Webhook URL configured in Rista: `POST /api/orders/callback`
- [ ] Header configured: `x-rista-secret: mcc-rista-callback-2026`
- [ ] Head Office outlet mapped for testing
- [ ] Channel set to "Delivery"

---

## 🧪 Test Scenarios

### Test 1: Simple Order (Single Item)
**Steps:**
1. Go to Shopify store online ordering page
2. Add 1 item (e.g., Regular Cappuccino)
3. Proceed to checkout
4. Complete payment
5. Check Rista POS "Head Office" outlet

**Expected Result:**
- ✅ Order appears in Rista POS within 30 seconds
- ✅ Order contains:
  - Customer name and phone
  - Item: Cappuccino (Regular)
  - Quantity: 1
  - Price: ₹142 (including GST)
  - Channel: Delivery
  - Payment: Online or Cash (depending on payment method)

**Verification Points:**
- [ ] Order invoice number matches
- [ ] Customer details populated
- [ ] Item name and price correct
- [ ] GST calculation correct (5%)
- [ ] Channel = Delivery
- [ ] Outlet = Head Office

---

### Test 2: Multi-Item Order with Variants
**Steps:**
1. Add 2 items with different sizes:
   - 1x Americano (Large)
   - 1x Latte (Extra Large)
2. Complete checkout

**Expected Result:**
- ✅ Order in Rista shows 2 line items
- ✅ Correct variant sizes mapped
- ✅ Correct individual prices

**Verification Points:**
- [ ] Line item count = 2
- [ ] Americano size = Large
- [ ] Latte size = Extra Large
- [ ] Total price matches Shopify

---

### Test 3: Order Status Callback
**Steps:**
1. Place order from Shopify
2. In Rista POS, **Accept** the order
3. Check middleware logs

**Expected Result:**
- ✅ Middleware receives callback: `POST /api/orders/callback`
- ✅ Log shows: `[rista-callback] Status update received:`
- ✅ Log shows invoice number and status = "Accepted"

**Verification Points:**
- [ ] Callback received within 5 seconds of status change
- [ ] Header `x-rista-secret` validated
- [ ] Invoice number matches original order
- [ ] Status value is correct

**Repeat for all statuses:**
- [ ] Prepared
- [ ] Ready for Pickup
- [ ] Dispatched
- [ ] Completed

---

### Test 4: Customer Loyalty Sync
**Steps:**
1. Customer creates account on Shopify
2. Customer places order with phone number
3. Check Rista customer database

**Expected Result:**
- ✅ Customer record created in Rista
- ✅ Phone number matches
- ✅ Email matches
- ✅ Order linked to customer for loyalty points

**Verification Points:**
- [ ] Customer exists in Rista
- [ ] Phone field populated
- [ ] Email field populated
- [ ] Customer ID returned in order payload

---

### Test 5: Payment Method Mapping
**Test 5a: Cash on Delivery**
1. Place order with COD payment method

**Expected Result:**
- ✅ Payment mode in Rista = "Cash"

**Test 5b: Online Payment**
1. Place order with Shopify Payments / Credit Card

**Expected Result:**
- ✅ Payment mode in Rista = "Online"

**Verification Points:**
- [ ] COD → "Cash" mapping works
- [ ] All other gateways → "Online" mapping works

---

## 🔍 Debug Endpoints

Use these endpoints to diagnose issues:

### 1. Test Menu API
```bash
GET https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Delivery
```
**Shows:** All menu items for Head Office outlet, Delivery channel

### 2. Debug Group Variants
```bash
GET https://mycoffeeco-middleware-original.onrender.com/api/menu/debug-variants
```
**Shows:** Raw Rista data for Group items (drinks with sizes)

### 3. Test Order Creation (Manual)
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9999999,
    "order_number": 9999,
    "email": "test@example.com",
    "customer": {
      "first_name": "Test",
      "last_name": "Customer",
      "phone": "+919876543210"
    },
    "billing_address": {
      "phone": "+919876543210"
    },
    "line_items": [
      {
        "sku": "228",
        "quantity": 1,
        "price": "104.00"
      }
    ],
    "note_attributes": [
      {"name": "Branch", "value": "HO"},
      {"name": "Channel", "value": "Delivery"}
    ],
    "total_price": "104.00",
    "gateway": "shopify_payments"
  }'
```

### 4. Test Rista Callback (Manual)
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders/callback \
  -H "Content-Type: application/json" \
  -H "x-rista-secret: mcc-rista-callback-2026" \
  -d '{
    "invoiceNumber": "TEST-001",
    "status": "Accepted",
    "fulfillmentStatus": "Accepted"
  }'
```
**Expected:** Middleware logs the status update

---

## 🐛 Common Issues and Solutions

### Issue 1: Order Not Appearing in Rista
**Possible Causes:**
- Middleware server down
- Wrong branch code in order
- Wrong channel name
- Item SKU doesn't exist in Rista

**Debug Steps:**
1. Check middleware logs for errors
2. Verify SKU exists: `GET /api/menu?branch=HO&channel=Delivery`
3. Check if `note_attributes` contains correct Branch and Channel

### Issue 2: Callback Not Received
**Possible Causes:**
- Webhook URL not configured in Rista
- Wrong secret header value
- Middleware server unreachable from Rista

**Debug Steps:**
1. Verify webhook URL in Rista settings
2. Check header: `x-rista-secret: mcc-rista-callback-2026`
3. Test manually with curl (see above)

### Issue 3: Customer Not Linked to Order
**Possible Causes:**
- Customer phone not provided at checkout
- Customer not synced to Rista before order
- Phone format mismatch

**Debug Steps:**
1. Verify customer has phone in Shopify
2. Check if customer webhook fired before order webhook
3. Test customer sync: `POST /api/customers/webhook/create`

### Issue 4: Wrong Prices in Rista
**Possible Causes:**
- GST calculation mismatch
- Wrong channel selected (prices differ by channel)

**Debug Steps:**
1. Check menu API for correct prices: `GET /api/menu?branch=HO&channel=Delivery`
2. Verify Shopify order total includes GST
3. Check `isPriceIncludesTax` in Rista catalog

---

## 📊 Expected Order Payload (Sent to Rista)

```json
{
  "orderNumber": "1025",
  "orderDate": "2026-08-13T10:30:00+05:30",
  "customer": {
    "id": "6a...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  },
  "orderType": "Online",
  "guestCount": 1,
  "items": [
    {
      "itemId": "6a521dd410975a04d6f857b8",
      "name": "Americano",
      "quantity": 1,
      "unitPrice": 104,
      "tax": 5,
      "taxTypeIds": ["6a3a41292bb3cdeaa1213d30"]
    }
  ],
  "charges": [
    {
      "name": "GST (5%)",
      "value": 5,
      "chargeType": "Tax",
      "chargeId": "tax_5_percent"
    }
  ],
  "channel": "Delivery",
  "branchCode": "HO",
  "paymentMode": "Online",
  "saleValue": 109,
  "callbackURL": "https://mycoffeeco-middleware-original.onrender.com/api/orders/callback",
  "source": "Shopify"
}
```

---

## 📧 Information to Share with Rista Team

**Subject:** Ready for Integration Testing - Webhook Endpoint Details

**Body:**
```
Hi Rista Team,

Thank you for configuring the webhook on your end. We're ready to begin testing.

Webhook Endpoint Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Callback URL:
https://mycoffeeco-middleware-original.onrender.com/api/orders/callback

🔐 Required Header:
x-rista-secret: mcc-rista-callback-2026

📊 Expected Payload Format:
{
  "invoiceNumber": "1025",
  "status": "Accepted",
  "fulfillmentStatus": "Accepted",
  "saleId": "6a...",
  "updatedAt": "2026-08-13T10:35:00+05:30"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Outlet: Head Office (Branch Code: HO)
Channel: Delivery

We will place test orders from our Shopify store and verify:
1. Orders appear in Rista POS correctly
2. Customer information is mapped
3. Items and prices are accurate
4. Status callbacks are received

Please confirm:
✅ Webhook URL configured in Rista
✅ Secret header configured
✅ Head Office outlet mapped for testing
✅ Channel set to "Delivery"

We'll begin testing and share results within 24 hours.

Best regards,
My Coffee Co Team
```

---

## ✅ Testing Sign-off Checklist

After completing all tests, verify:

- [ ] ✅ Simple orders work (single item)
- [ ] ✅ Multi-item orders work
- [ ] ✅ Variant sizes map correctly (Regular/Large/Extra Large)
- [ ] ✅ Customer information syncs
- [ ] ✅ Status callbacks received for all states
- [ ] ✅ Payment modes map correctly (Cash/Online)
- [ ] ✅ Prices and GST calculated correctly
- [ ] ✅ Loyalty points calculated for repeat customers
- [ ] ✅ No duplicate orders created
- [ ] ✅ Error handling works (invalid SKU, missing customer, etc.)

---

## 🚀 Next Steps After Successful Testing

1. **Go Live on Production Outlets:**
   - Update branch codes for live outlets (DB1, DB6, IFT)
   - Test each outlet individually
   - Verify menu items match each location

2. **Monitor Production:**
   - Set up error alerting (email/SMS)
   - Monitor callback logs daily
   - Track order success rate

3. **Customer Training:**
   - Train staff on handling online orders
   - Document order acceptance flow
   - Set up notification system for new orders

4. **Performance Optimization:**
   - Add caching for menu API
   - Optimize image loading
   - Set up CDN for static assets

---

## 📞 Support Contacts

**Technical Issues:**
- Developer: [Your contact]
- Middleware logs: Check Render dashboard

**Rista API Issues:**
- Rista support: [Rista contact email]
- API documentation: https://api.ristaapps.com/docs

**Shopify Issues:**
- Shopify Partner Dashboard
- Theme customization: Shopify Admin → Themes
