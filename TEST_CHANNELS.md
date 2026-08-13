# Test All Channels - Find Which Has Items

## 🔍 Test Each Channel

Open these URLs one by one and paste the results:

### 1. Website Channel (Current - Empty)
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Website
```
**Result:** ❌ Empty categories

---

### 2. Takeaway Channel
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Takeaway
```
**Paste result here:**

---

### 3. Dine In Channel
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Dine%20In
```
**Paste result here:**

---

### 4. Delivery Channel
```
https://mycoffeeco-middleware-original.onrender.com/api/menu?branch=HO&channel=Delivery
```
**Paste result here:**

---

## ✅ Once You Find a Working Channel

If you find that, for example, "Takeaway" has items, then temporarily update your `.env`:

```bash
SHOPIFY_RISTA_CHANNEL=Takeaway  # Use whatever channel has items
```

Then:
1. Push to GitHub
2. Wait for Render to deploy
3. Test orders with the working channel
4. Ask Rista to configure "Website" channel properly for production

---

## 🎯 Expected Response (When Channel Has Items)

A working channel should return something like:

```json
{
  "success": true,
  "branch": "HO",
  "channel": "Takeaway",
  "categories": [
    {
      "categoryId": "6a521dd49dd541a4e9f8dfff",
      "name": "Hot Beverages",
      "items": [
        {
          "itemId": "6a521dd410975a04d6f857b6",
          "type": "Group",
          "name": "Americano",
          "price": 104,
          "variants": [
            { "label": "Regular", "price": 104, "skuCode": "228" },
            { "label": "Large", "price": 123, "skuCode": "229" },
            { "label": "Extra Large", "price": 151, "skuCode": "230" }
          ]
        }
      ]
    }
  ]
}
```

If you see this structure with actual items → that channel is configured ✅

---

## 📋 Decision Matrix

| Scenario | Action |
|----------|--------|
| "Takeaway" has items | Use Takeaway temporarily, ask Rista to configure Website |
| "Delivery" has items | Use Delivery temporarily, ask Rista to configure Website |
| "Dine In" has items | Use Dine In temporarily, ask Rista to configure Website |
| NO channels have items | Critical issue - contact Rista immediately |

---

## 🚨 If NO Channels Have Items

This would indicate a bigger problem:
1. API credentials might be wrong
2. Head Office (HO) branch doesn't exist
3. No menu configured in Rista at all

In this case, test the debug endpoint:
```
https://mycoffeeco-middleware-original.onrender.com/api/menu/debug-variants
```

This will show raw Rista data regardless of channel/branch.
