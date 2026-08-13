# Quick Testing Checklist

## ⚡ Before You Start Testing

### 1. ✅ Verify Middleware is Running
Open this in your browser:
```
https://mycoffeeco-middleware-original.onrender.com/
```
**Expected:** Should return "OK" or homepage

### 2. ✅ Check Menu API Works
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Delivery
```
**Expected:** JSON with menu items for Head Office

### 3. ✅ Verify Rista Credentials Work
Check your `.env` file has:
```
RISTA_API_KEY=1a642e06-b280-4e22-8e3b-b08edf431a5c
RISTA_SECRET_KEY=tnxWpKSXF_LuzmGeX9i-sh60YegyRHpgfIazHtJuZ88
RISTA_CALLBACK_SECRET=mcc-rista-callback-2026
RISTA_BRANCH_CODE=HO
SHOPIFY_RISTA_CHANNEL=Delivery
```

---

## 🧪 Test 1: Simple Order (5 minutes)

### Step-by-Step:
1. ✅ Go to your Shopify online ordering page
2. ✅ Select **Head Office** as branch
3. ✅ Select **Delivery** as channel
4. ✅ Add 1 simple item (e.g., Regular Cappuccino)
5. ✅ Go to checkout
6. ✅ Fill customer details (name, phone, email)
7. ✅ Complete payment
8. ✅ **IMMEDIATELY** check Rista POS Head Office outlet

### ✅ Success Criteria:
- [ ] Order appears in Rista POS within 30 seconds
- [ ] Customer name matches
- [ ] Phone number is correct
- [ ] Item name is correct
- [ ] Price matches (₹142 for Regular Cappuccino)
- [ ] Channel shows "Delivery"
- [ ] Payment mode shows "Online" or "Cash"

### ❌ If Order Doesn't Appear:
1. Check middleware logs on Render dashboard
2. Verify branch code = HO in order
3. Test menu API to confirm item SKU exists
4. Contact Rista team if API returns error

---

## 🧪 Test 2: Status Callback (2 minutes)

### Step-by-Step:
1. ✅ After order appears in Rista POS
2. ✅ Click **"Accept"** button in POS
3. ✅ Check middleware logs immediately

### ✅ Success Criteria:
**In Render Logs, you should see:**
```
[rista-callback] Status update received:
  Invoice : 1025
  Status  : Accepted
```

### ❌ If Callback Not Received:
1. Verify Rista configured webhook URL correctly
2. Verify header `x-rista-secret: mcc-rista-callback-2026`
3. Test manually:
```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/orders/callback \
  -H "Content-Type: application/json" \
  -H "x-rista-secret: mcc-rista-callback-2026" \
  -d '{"invoiceNumber":"1025","status":"Accepted"}'
```

---

## 🧪 Test 3: Multi-Item with Variants (5 minutes)

### Step-by-Step:
1. ✅ Add 2 drinks with different sizes:
   - 1x Americano (Large)
   - 1x Latte (Extra Large)
2. ✅ Complete checkout
3. ✅ Check Rista POS

### ✅ Success Criteria:
- [ ] 2 line items in Rista order
- [ ] Americano shows "Large" size
- [ ] Latte shows "Extra Large" size
- [ ] Individual prices correct
- [ ] Total matches Shopify

---

## 🧪 Test 4: Payment Methods (5 minutes)

### Test 4a: Cash on Delivery
1. ✅ Place order with COD payment
2. ✅ Check Rista: Payment mode = "Cash"

### Test 4b: Online Payment
1. ✅ Place order with Shopify Payments
2. ✅ Check Rista: Payment mode = "Online"

---

## 📊 Quick Status Summary

| Test | Status | Notes |
|------|--------|-------|
| Middleware Running | ⏳ | Check Render dashboard |
| Menu API Works | ⏳ | Test /api/menu endpoint |
| Simple Order | ⏳ | 1 item, basic checkout |
| Status Callback | ⏳ | Accept order in POS |
| Multi-Item Order | ⏳ | 2+ items, variants |
| COD Payment | ⏳ | Payment = "Cash" |
| Online Payment | ⏳ | Payment = "Online" |
| Customer Sync | ⏳ | Phone/email in Rista |

---

## 🚨 Common Issues - Quick Fixes

### Issue: "Order not appearing in Rista"
**Fix:** Check middleware logs for error message

### Issue: "Wrong branch/outlet"
**Fix:** Verify order has `note_attributes: [{"name":"Branch","value":"HO"}]`

### Issue: "Wrong channel"
**Fix:** Verify order has `note_attributes: [{"name":"Channel","value":"Delivery"}]`

### Issue: "Customer phone missing"
**Fix:** Verify customer filled phone at checkout

### Issue: "Callback not received"
**Fix:** Verify Rista configured webhook URL and secret header

---

## 📞 Emergency Contacts

**Rista Team:**
- Email: [Their support email]
- For: API issues, webhook config, POS errors

**Your Team:**
- Developer: [Your contact]
- For: Middleware logs, code issues

---

## ✅ After All Tests Pass

Send this email to Rista team:

**Subject:** ✅ Integration Testing Complete - Ready for Production

**Body:**
```
Hi Rista Team,

We've completed integration testing successfully! 

Results:
✅ Simple orders working
✅ Multi-item orders working
✅ Status callbacks received
✅ Customer sync working
✅ Payment methods mapped correctly

We're ready to proceed with production setup for all outlets:
- DB1 (DLF Building 14)
- DB6 (DLF Building 6)
- IFT (AIPL - Sector 62)

Please confirm when we can begin rolling out to these locations.

Thank you for your support!

Best regards,
My Coffee Co Team
```

---

## 🎉 Success Metrics

**Target:** All 8 tests passing ✅  
**Timeline:** 24-48 hours  
**Go-Live:** After Rista team confirmation

---

_Keep this checklist handy during testing. Check off items as you complete them._
