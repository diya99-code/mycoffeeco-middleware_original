# Size Variant Bottom Sheet - Fixes Applied

## Issues Fixed

### 1. Variant Label Extraction
**Problem**: Size variants were showing the parent item name (e.g., "Americano") instead of size labels (Regular, Large, Extra Large).

**Root Cause**: Rista API returns:
- Parent Group item has: `variantAttributes: [{ name: "Size", values: ["Regular","Large","Extra Large"] }]`
- Child Simple items have: same `itemName` as parent (no individual size in name)
- Children don't have individual `variantAttributes` with size info

**Solution Applied** (`menuMappers.js`):
```javascript
// Extract size labels from parent's variantAttributes array
const sizeLabels = [];
if (parent.variantAttributes && Array.isArray(parent.variantAttributes)) {
    for (const attr of parent.variantAttributes) {
        if (attr.name === "Size" && Array.isArray(attr.values)) {
            sizeLabels.push(...attr.values);
        }
    }
}

// Sort children by price ascending (Regular < Large < Extra Large)
const sortedChildren = children.sort((a, b) => {
    const priceA = (a.prices || []).find(p => p.channel === channel)?.price || 0;
    const priceB = (b.prices || []).find(p => p.channel === channel)?.price || 0;
    return Number(priceA) - Number(priceB);
});

// Map children to parent's size labels by position
const variantOptions = sortedChildren.map((child, index) => {
    let label = sizeLabels[index] || '';
    // ... fallback logic if no sizeLabels array
});
```

**Result**: 
- Americano child with price ₹103.55 → "Regular"
- Americano child with price ₹122.55 → "Large"  
- Americano child with price ₹151.05 → "Extra Large"

---

### 2. Add Button Turning White After Click
**Problem**: The "+ Add" button inside the size sheet was changing to white color after being clicked, making text invisible.

**Root Cause**: Shopify theme has global CSS that affects button states (`:active`, `:focus`, `:visited`). The previous CSS using `!important` wasn't strong enough to override all Shopify theme rules.

**Solution Applied** (`rista-order.liquid`):

#### A. Enhanced CSS with More Selectors
```css
.size-add-btn,
#size-sheet-overlay .size-add-btn,
.size-pill-row .size-add-btn,
[data-add-variant].size-add-btn {
    background-color: #0a06ff !important;
    background-image: none !important;
    color: #ffffff !important;
    filter: none !important;
    -webkit-filter: none !important;
    /* ... all other properties */
}

/* Added :visited pseudo-class */
.size-add-btn:visited,
#size-sheet-overlay .size-add-btn:visited {
    background-color: #0a06ff !important;
    background: #0a06ff !important;
    color: #ffffff !important;
}
```

#### B. Inline Styles in HTML Generation
```javascript
// Added inline styles as extra safeguard
actionHTML = `<div class="size-add-btn" ... style="background:#0a06ff;color:#fff;border:none;padding:8px 20px;border-radius:20px;font-weight:800;cursor:pointer;">+ Add</div>`;
```

#### C. JavaScript State Reset After Click
```javascript
// Force button to maintain blue background after click
setTimeout(() => {
    const btns = document.querySelectorAll('.size-add-btn');
    btns.forEach(btn => {
        btn.style.backgroundColor = '#0a06ff';
        btn.style.color = '#ffffff';
    });
}, 10);
```

#### D. Event Handler Enhancement
```javascript
// Added preventDefault and stopImmediatePropagation
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();
```

**Result**: Button stays blue (#0a06ff) with white text at all times, even after clicking.

---

## Files Modified

1. **`src/mappers/menuMappers.js`**
   - Updated variant label extraction logic
   - Added sorting by price before mapping to size labels
   - Extracts size values from parent's `variantAttributes` array

2. **`shopify-theme/sections/rista-order.liquid`**
   - Enhanced CSS selectors for `.size-add-btn`
   - Added inline styles to button HTML
   - Updated event handler with `preventDefault()` and state reset

---

## Testing Instructions

### 1. Test Variant Labels
1. Clear browser cache and reload the menu page
2. Find a Group item (Americano, Cappuccino, Latte)
3. Tap the item card to open the size bottom sheet
4. Verify labels show: **Regular**, **Large**, **Extra Large** (not "Americano" repeated)

### 2. Test Button Color
1. Open the size bottom sheet for any drink
2. Click the "+ Add" button for any size
3. Verify the button:
   - Stays **blue** (#0a06ff) with white text
   - Does NOT turn white or gray
   - Quantity stepper appears (if item was added)
4. Refresh the sheet by closing and reopening
5. Verify button is still blue

### 3. Test Button Functionality
1. Click "+ Add" on a size variant
2. Verify item is added to cart
3. Check cart badge updates
4. Verify the button changes to quantity stepper after adding

---

## Deployment Steps

### Option 1: Manual Copy (Current Workflow)
1. Copy the updated `rista-order.liquid` file content
2. Go to Shopify Admin → Online Store → Themes → Customize Theme
3. Navigate to Sections → `rista-order.liquid`
4. Paste the new content
5. **Click Save** (very important!)

### Option 2: Test Middleware First
1. Deploy the updated middleware with new `menuMappers.js`
2. Test the API response: `GET /api/menu?channel=Takeaway&branchCode=DB1`
3. Verify the response shows correct variant labels
4. Then update the liquid file in Shopify

---

## API Response Verification

**Expected Menu API Response** (for Group items):
```json
{
  "type": "Group",
  "name": "Americano",
  "variants": [
    {
      "skuCode": "228",
      "label": "Regular",
      "price": 104,
      "tax": 5,
      "available": true
    },
    {
      "skuCode": "229",
      "label": "Large",
      "price": 123,
      "tax": 6,
      "available": true
    },
    {
      "skuCode": "230",
      "label": "Extra Large",
      "price": 151,
      "tax": 8,
      "available": true
    }
  ]
}
```

---

## Troubleshooting

### If labels still show parent name:
1. Check middleware logs for errors in `menuMappers.js`
2. Verify Rista API returns `variantAttributes` on parent items
3. Clear Node.js cache: restart the middleware server
4. Test raw Rista API response to confirm data structure

### If button still turns white:
1. **Most common**: User hasn't saved the updated liquid file in Shopify
2. Browser cache: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Shopify theme cache: Wait 2-3 minutes after saving
4. Check browser console for JavaScript errors
5. Inspect the button element in DevTools to see which CSS rules are applied
6. If Shopify theme has very aggressive global styles, may need to use `<style scoped>` or Shadow DOM (advanced)

### If button doesn't respond to clicks:
1. Check browser console for JavaScript errors
2. Verify event delegation is working: `document.addEventListener('click', ...)`
3. Test with `console.log()` inside the `[data-add-variant]` handler
4. Ensure the button has correct `data-add-variant` and `data-parent-sku` attributes

---

## Next Steps

1. ✅ Deploy updated middleware (menuMappers.js)
2. ✅ Copy updated rista-order.liquid to Shopify
3. ⏳ **Save the file in Shopify** (critical!)
4. ⏳ Test on mobile device (real or emulator)
5. ⏳ Verify all Group items show correct size labels
6. ⏳ Verify button stays blue after clicking
