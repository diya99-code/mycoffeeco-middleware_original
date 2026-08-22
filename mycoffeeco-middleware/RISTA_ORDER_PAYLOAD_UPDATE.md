# Rista Order Payload Update - August 2026

## Issue Fixed
Orders were not being accepted by Rista POS system due to incorrect payload format.

---

## Changes Made

Updated `src/mappers/orderMapper.js` to match the new Rista API format provided by their team.

### Key Changes:

#### 1. **Source Info - New Required Fields**
```javascript
sourceInfo: {
    invoiceNumber: shopifyOrder.name,
    orderTransactionId: String(shopifyOrder.id),
    invoiceDate: shopifyOrder.created_at,
    orderTime: shopifyOrder.created_at,        // NEW
    source: "Online",                          // Changed from "Shopify"
    isEditable: false,                         // Changed from true
    verifyCoupons: false,                      // Changed from true
    isEcomOrder: true,
    outletId: process.env.RISTA_OUTLET_ID,    // NEW
    callbackURL: process.env.SHOPIFY_CALLBACK_URL || "",
    callbackHeaders: {}                        // NEW
}
```

#### 2. **Created Date - New Top-Level Field**
```javascript
createdDate: shopifyOrder.created_at  // NEW - top level field
```

#### 3. **Channel - Updated Default**
```javascript
channel: "Website"  // Changed from "Takeaway"
```

#### 4. **Customer - Simplified Structure**
```javascript
customer: {
    name: "Customer Name",
    phoneNumber: "9999999999"
    // Removed: id, email
}
```

#### 5. **Items - New Tax Structure**
Each item now requires:
```javascript
items: [{
    skuCode: "SKU-001",
    shortName: "Item Name",
    longName: "Item Name",
    itemNature: "Service",      // Changed from "Goods"
    quantity: 1,
    unitPrice: 200.0,
    itemAmount: 200.0,
    
    // NEW: Required tax structure with CGST/SGST
    taxes: [
        {
            name: "CGST",
            percentage: 0.0,
            amountExcluded: 0.0,
            amount: 0.0
        },
        {
            name: "SGST",
            percentage: 0.0,
            amountExcluded: 0.0,
            amount: 0.0
        }
    ],
    
    taxAmountExcluded: 0.0,      // NEW
    itemTotalAmount: 200.0
    
    // Removed: variants, note, options
}]
```

#### 6. **Order-Level Taxes - New Format**
```javascript
taxes: [
    {
        name: "CGST",
        percentage: 0.0,
        amountExcluded: 0.0,
        amount: 0.0,
        itemTaxExcluded: 0.0    // NEW field
    },
    {
        name: "SGST",
        percentage: 0.0,
        amountExcluded: 0.0,
        amount: 0.0,
        itemTaxExcluded: 0.0
    }
]
```

#### 7. **Payments - Simplified**
```javascript
payments: [{
    mode: "Online",
    amount: 0.0    // Changed: Rista will calculate from billAmount
    // Removed: reference, postedDate
}]
```

#### 8. **Discounts - New Format**
```javascript
discounts: [{
    name: "Discount Name",
    type: "Absolute",
    rate: 200.0,
    saleAmount: 200.0,     // NEW
    amount: -200.0,
    reason: "Discount Reason"  // NEW
}]
```

#### 9. **Amounts - Restructured**
```javascript
itemTotalAmount: 200.0,
totalAmount: 200.0,
discountAmount: 0.0,
billAmount: 0.0        // NEW - Rista calculates this
```

#### 10. **Removed Fields**
- `delivery` object (entire section removed)
- `charges` array (shipping charges removed)
- `billRoundedAmount`
- `taxAmountIncluded`
- `tipAmount`
- `note`
- `tags`

---

## Environment Variables

Add this new variable to your `.env` file:

```env
RISTA_OUTLET_ID=shopify_outlet
```

Update existing variable:
```env
SHOPIFY_RISTA_CHANNEL=Website
```

---

## Testing

### Before Deploying:

1. **Update .env file**:
   ```bash
   # Add new variable
   RISTA_OUTLET_ID=your_outlet_id
   
   # Update channel
   SHOPIFY_RISTA_CHANNEL=Website
   ```

2. **Test with a sample order**:
   ```bash
   node debug-order.js
   ```

3. **Verify payload structure** matches Rista's example

---

## New Payload Structure Example

```json
{
  "branchCode": "HO",
  "status": "Open",
  "createdDate": "2026-08-19T15:00:00+05:30",
  "sourceInfo": {
    "invoiceNumber": "#1001",
    "orderTransactionId": "123456789",
    "invoiceDate": "2026-08-19T15:00:00+05:30",
    "orderTime": "2026-08-19T15:00:00+05:30",
    "source": "Online",
    "isEditable": false,
    "verifyCoupons": false,
    "isEcomOrder": true,
    "outletId": "shopify_outlet",
    "callbackURL": "https://example.com/callback",
    "callbackHeaders": {}
  },
  "channel": "Website",
  "customer": {
    "name": "Test Customer",
    "phoneNumber": "9999999999"
  },
  "items": [
    {
      "skuCode": "SKU-001",
      "shortName": "Coffee",
      "longName": "Premium Coffee",
      "itemNature": "Service",
      "quantity": 1,
      "unitPrice": 200.0,
      "itemAmount": 200.0,
      "taxes": [
        {
          "name": "CGST",
          "percentage": 0.0,
          "amountExcluded": 0.0,
          "amount": 0.0
        },
        {
          "name": "SGST",
          "percentage": 0.0,
          "amountExcluded": 0.0,
          "amount": 0.0
        }
      ],
      "taxAmountExcluded": 0.0,
      "itemTotalAmount": 200.0
    }
  ],
  "taxes": [
    {
      "name": "CGST",
      "percentage": 0.0,
      "amountExcluded": 0.0,
      "amount": 0.0,
      "itemTaxExcluded": 0.0
    },
    {
      "name": "SGST",
      "percentage": 0.0,
      "amountExcluded": 0.0,
      "amount": 0.0,
      "itemTaxExcluded": 0.0
    }
  ],
  "itemTotalAmount": 200.0,
  "totalAmount": 200.0,
  "discountAmount": 0.0,
  "billAmount": 0.0,
  "payments": [
    {
      "mode": "Online",
      "amount": 0.0
    }
  ],
  "discounts": []
}
```

---

## Deployment Steps

1. **Update .env file** with new variables
2. **Commit changes**:
   ```bash
   git add src/mappers/orderMapper.js
   git commit -m "Update order payload to match new Rista API format"
   git push origin main
   ```
3. **Deploy to Render** (auto-deploys from git)
4. **Test with a real order** from Shopify
5. **Monitor Render logs** for successful order submission

---

## What to Watch For

### Success Indicators:
- ✅ Orders appear in Rista POS immediately
- ✅ No errors in Render logs
- ✅ Order details match Shopify order

### Troubleshooting:
- If orders still fail, check Render logs for exact error
- Verify all required fields are present
- Ensure tax structure is correct (CGST/SGST)
- Confirm `outletId` matches your Rista setup

---

## Summary

**Old Format**: Complex payload with delivery, charges, multiple tax formats  
**New Format**: Simplified payload with strict tax structure (CGST/SGST)

**Key Difference**: The new format expects Rista to calculate `billAmount` and payment amounts, while the old format provided these values.

---

## Files Modified

- ✅ `src/mappers/orderMapper.js` - Complete restructure to match new API

---

## Next Steps

1. Add `RISTA_OUTLET_ID` to `.env`
2. Update `SHOPIFY_RISTA_CHANNEL=Website` in `.env`
3. Deploy to Render
4. Test with a Shopify order
5. Verify order appears in Rista POS

---

**Orders should now be accepted by Rista POS!** 🎉

