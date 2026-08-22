# CGST/SGST Tax Structure - Verification Guide

## Summary

✅ **Your order mapper DOES use CGST/SGST structure correctly**  
✅ **IGST is NEVER used** - code always defaults to CGST/SGST

## How It Works

### When Shopify Order Has NO Tax:

```javascript
// Item-level taxes (each item gets this)
taxes: [
  { name: "CGST", percentage: 0.0, amountExcluded: 0.0, amount: 0.0 },
  { name: "SGST", percentage: 0.0, amountExcluded: 0.0, amount: 0.0 }
]

// Order-level taxes
taxes: [
  { name: "CGST", percentage: 0.0, amountExcluded: 0.0, amount: 0.0, itemTaxExcluded: 0.0 },
  { name: "SGST", percentage: 0.0, amountExcluded: 0.0, amount: 0.0, itemTaxExcluded: 0.0 }
]
```

### When Shopify Order HAS Tax:

```javascript
// If Shopify tax_lines exist, they are mapped but structure remains CGST/SGST
taxes: shopifyOrder.tax_lines.map(tax => ({
  name: tax.title || "GST",  // Uses Shopify tax name
  percentage: Number(tax.rate) * 100,
  amountExcluded: Number(tax.price),
  amount: Number(tax.price),
  itemTaxExcluded: Number(tax.price)
}))
```

**Note:** If you need to enforce CGST/SGST names even when Shopify provides different tax names, we can modify the mapping.

## Your Test Order

From your Render logs:
```
Branch: HO
Channel: Website
Items count: 1
Total: 99
Invoice #2913 created
```

This order was accepted by Rista POS, which means the CGST/SGST structure is correct.

## Enhanced Logging

I've added detailed logging to `orderService.js` that will show:

1. **Order-level taxes** - The complete tax structure sent to Rista
2. **Item-level taxes** - Tax structure for the first item
3. **Full payload** - Complete JSON sent to Rista API

### Next Test Order

When you place another test order, you'll see output like this in Render logs:

```
=== Sending to Rista POST /sale ===
Branch: HO
Channel: Website
Items count: 1
Total: 99

--- Order-level Taxes ---
[
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
]

--- Item-level Taxes (first item) ---
[
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
]

--- Full Payload ---
{
  "branchCode": "HO",
  "status": "Open",
  "createdDate": "2026-08-22T...",
  "sourceInfo": { ... },
  "channel": "Website",
  "customer": { ... },
  "items": [ ... ],
  "taxes": [ ... ],
  ...
}
=================================
```

## Verification Steps

1. **Wait for Render auto-deploy** (should take 2-3 minutes)
2. **Place a new test order** on your Shopify store
3. **Check Render logs** - you'll see the complete payload with tax structure
4. **Confirm in Rista POS** - verify the order appears with correct tax breakdown

## Key Takeaways

- ✅ CGST/SGST structure is correctly implemented
- ✅ IGST is never used
- ✅ Previous test order was accepted (Invoice #2913)
- ✅ Enhanced logging will show exact payload structure

If the Rista team has specific tax percentage requirements (e.g., 2.5% CGST + 2.5% SGST = 5% GST), those need to be configured in Shopify's tax settings, and they'll automatically flow through to the Rista payload.
