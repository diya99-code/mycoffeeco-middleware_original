# ✅ Rista Integration - Confirmed Configuration

## 🎯 Official Configuration from Rista Team

### Branch Details
```
Branch Name: Head Office
Branch Code: HO
Outlet ID: webhook_6a7c17fcbe032
Channel Name: Website
```

### Webhook Configuration
```
Callback URL: https://mycoffeeco-middleware-original.onrender.com/api/orders/callback
Required Header: x-rista-secret: mcc-rista-callback-2026
```

---

## 📝 Updated Middleware Configuration

Your `.env` file has been updated with:

```bash
# Rista Branch Configuration
RISTA_BRANCH_CODE=HO
SHOPIFY_RISTA_CHANNEL=Website  # ← Updated from "Takeaway" to "Website"

# Rista API Credentials
RISTA_API_KEY=1a642e06-b280-4e22-8e3b-b08edf431a5c
RISTA_SECRET_KEY=tnxWpKSXF_LuzmGeX9i-sh60YegyRHpgfIazHtJuZ88

# Callback Security
RISTA_CALLBACK_SECRET=mcc-rista-callback-2026
```

---

## 🚀 IMMEDIATE ACTIONS REQUIRED

### 1. ⚠️ RESTART YOUR MIDDLEWARE SERVER
**Critical:** The channel change from "Takeaway" → "Website" requires a server restart.

```bash
# In your terminal:
Ctrl + C  (stop current server)
cd mycoffeeco-middleware
node src/app.js
```

**OR if deployed on Render:**
- Go to Render dashboard
- Click "Manual Deploy" → "Deploy latest commit"
- Or just push to GitHub (will auto-deploy)

### 2. ✅ Verify Menu API with New Channel
After restarting, test this URL:

```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Website
```

**Expected:** JSON with menu items for "Website" channel

**Important:** Prices may differ between channels! Verify prices match what you want to show online.

### 3. ✅ Update Shopify Frontend (Optional)
If your Shopify theme references the channel, update it to "Website":

```javascript
// In rista-order.liquid, find any hardcoded channel references
// Change from:
channel: 'Takeaway'
// To:
channel: 'Website'
```

But if it already reads from the branch/channel selector, no change needed.

---

## 🧪 Testing Commands (Updated)

### Test 1: Menu API
```bash
curl "https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Website"
```

### Test 2: Debug Variants
```bash
curl "https://mycoffeeco-middleware-original.onrender.com/api/menu/debug-variants"
```

### Test 3: Test Order (Manual)
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": 9999991,
    "order_number": 9991,
    "email": "test@mycoffeeco.com",
    "customer": {
      "first_name": "Test",
      "last_name": "User",
      "phone": "+919876543210"
    },
    "billing_address": {
      "phone": "+919876543210"
    },
    "line_items": [
      {
        "sku": "228",
        "name": "Americano",
        "quantity": 1,
        "price": "104.00"
      }
    ],
    "note_attributes": [
      {"name": "Branch", "value": "HO"},
      {"name": "Channel", "value": "Website"}
    ],
    "total_price": "104.00",
    "gateway": "shopify_payments"
  }'
```

**Expected:** Order appears in Rista POS Head Office with Channel = "Website"

### Test 4: Test Callback (Simulate Rista)
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders/callback \
  -H "Content-Type: application/json" \
  -H "x-rista-secret: mcc-rista-callback-2026" \
  -d '{
    "invoiceNumber": "TEST-001",
    "status": "Accepted",
    "fulfillmentStatus": "Accepted",
    "outletId": "webhook_6a7c17fcbe032"
  }'
```

**Expected:** `200 OK` response, log entry in Render dashboard

---

## 📊 Configuration Comparison

| Setting | Old Value | ✅ New Value | Source |
|---------|-----------|--------------|--------|
| Branch Code | HO | HO | ✅ Confirmed by Rista |
| Channel Name | Takeaway | **Website** | ✅ Confirmed by Rista |
| Outlet ID | (not used) | webhook_6a7c17fcbe032 | ℹ️ Reference only |
| Callback Secret | mcc-rista-callback-2026 | mcc-rista-callback-2026 | ✅ No change |

---

## ⚠️ IMPORTANT NOTES

### 1. Channel Name is Case-Sensitive
- Use exactly: `Website` (capital W)
- Not: `website`, `WEBSITE`, `web site`

### 2. Outlet ID is for Reference
- You don't need to use `webhook_6a7c17fcbe032` in your API calls
- It's Rista's internal identifier for the Head Office outlet
- Branch Code `HO` is sufficient

### 3. Verify Prices for "Website" Channel
Different channels may have different prices in Rista:
- Dine In: ₹141.55
- Takeaway: ₹141.55
- Website: ₹??? (may be different)

**Test the menu API to confirm prices are correct for online orders.**

---

## ✅ Quick Test Checklist

After restarting server:

- [ ] ✅ Server restarts successfully
- [ ] ✅ Menu API returns items for `channel=Website`
- [ ] ✅ Prices look correct for online ordering
- [ ] ✅ Place test order from Shopify
- [ ] ✅ Order appears in Rista POS Head Office
- [ ] ✅ Order shows Channel = "Website"
- [ ] ✅ Accept order in POS
- [ ] ✅ Callback received in middleware logs

---

## 🚨 If Menu API Returns Empty Items

If `GET /api/menu?branch=HO&channel=Website` returns empty categories or items:

**Cause:** Rista hasn't configured prices for the "Website" channel yet.

**Solution:** Ask Rista team to:
1. Go to Rista admin panel
2. Select Head Office outlet
3. Configure prices for "Website" channel
4. Ensure all menu items have prices assigned to this channel

---

## 📧 Reply to Rista Team

Copy and send this:

---

**Subject:** ✅ Configuration Received - Ready to Test

Hi Rista Team,

Thank you for providing the configuration details:

```
Branch Name: Head Office
Branch Code: HO
Outlet ID: webhook_6a7c17fcbe032
Channel Name: Website
```

We have updated our middleware configuration to use:
- Branch Code: `HO`
- Channel: `Website` ✅

**Confirmation Questions:**

1. ✅ Is the webhook callback URL configured on your end?
   - URL: `https://mycoffeeco-middleware-original.onrender.com/api/orders/callback`
   - Header: `x-rista-secret: mcc-rista-callback-2026`

2. ✅ Are menu items priced for the "Website" channel?
   - We'll test the menu API to verify

3. ✅ Which statuses will trigger callbacks?
   - Accepted, Prepared, Ready, Dispatched, Completed, Rejected?

**Next Steps:**

We will:
1. ✅ Restart middleware with new channel configuration
2. ✅ Test menu API for "Website" channel
3. ✅ Place test orders from Shopify store
4. ✅ Verify orders appear in POS with Channel = "Website"
5. ✅ Test status callbacks when orders are accepted

We'll begin testing within the next 2 hours and report results by end of day.

Please confirm the webhook is configured and we're ready to proceed.

Best regards,  
My Coffee Co Team

---

## 🎯 SUCCESS CRITERIA

✅ Test order placed from Shopify  
✅ Order appears in Rista POS Head Office  
✅ Channel shows "Website" (not Takeaway/Dine In)  
✅ Customer info populated correctly  
✅ Items and prices match  
✅ Accept order in POS triggers callback  
✅ Middleware receives and logs status update  

**If all 7 criteria pass → Integration successful! 🎉**

---

## 📞 Support

**Middleware Issues:**
- Check Render dashboard logs
- Verify `.env` file updated
- Restart server after changes

**Rista API Issues:**
- Contact Rista support team
- Provide invoice number and timestamp
- Share error logs if any

---

_Configuration last updated: 2026-08-13_
_Channel updated from "Takeaway" to "Website" per Rista team confirmation_
