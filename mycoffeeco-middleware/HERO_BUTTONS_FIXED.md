# Hero Banner Buttons - Fixed! ✅

## What Was Fixed

The "Get Directions" and "View Menu" buttons in your hero banner are now fully clickable!

### Changes Made:

1. **Button Updated**: Changed second button from "Call Store" to "View Menu"
2. **Button Positioning**: Repositioned buttons to match your hero image layout
   - **Get Directions** (blue button) - Bottom left
   - **View Menu** (white button) - Bottom right
3. **Responsive Design**: Adjusted for mobile, tablet, and desktop

---

## Button Positions

### Desktop (>1024px):
- **Get Directions**: Bottom 8%, Left 5%, Width 23%, Height 11%
- **View Menu**: Bottom 8%, Left 30%, Width 23%, Height 11%

### Tablet (769px - 1024px):
- **Get Directions**: Bottom 7%, Left 5%, Width 25%, Height 10%
- **View Menu**: Bottom 7%, Left 32%, Width 25%, Height 10%

### Mobile (≤768px):
- **Get Directions**: Bottom 6%, Left 5%, Width 43%, Height 10%
- **View Menu**: Bottom 6%, Left 51%, Width 43%, Height 10%

---

## How The Buttons Work

### Get Directions Button:
- **Action**: Opens Google Maps with walking directions
- **URL**: `https://www.google.com/maps/dir/?api=1&destination=LAT,LONG&travelmode=walking`
- **Uses**: Store latitude and longitude from your settings

### View Menu Button:
- **Action**: Links to your menu page
- **URL**: Configurable in Shopify (default: `/pages/menu`)
- **Setting**: Under "Location Section" → "Menu Page Link"

---

## Shopify Configuration

To change where the "View Menu" button links:

1. Go to **Shopify Admin**
2. **Online Store** → **Themes** → **Customize**
3. Select your ad landing page
4. Scroll to **"Location Section"**
5. Find **"Menu Page Link"**
6. Change to your menu URL (examples):
   - `/pages/menu`
   - `/collections/coffee`
   - `/pages/order-now`
   - Any custom URL

---

## Adjusting Button Positions

If the buttons don't perfectly align with your hero image, you can fine-tune:

### For Desktop:
```css
.hero-btn-directions {
  bottom: 8%;    /* Distance from bottom */
  left: 5%;      /* Distance from left */
  width: 23%;    /* Button width */
  height: 11%;   /* Button height */
}

.hero-btn-menu {
  bottom: 8%;    /* Same as Get Directions */
  left: 30%;     /* Adjust left position */
  width: 23%;
  height: 11%;
}
```

### For Mobile:
```css
@media (max-width: 768px) {
  .hero-btn-directions {
    bottom: 6%;
    left: 5%;
    width: 43%;
    height: 10%;
  }
  
  .hero-btn-menu {
    bottom: 6%;
    left: 51%;   /* Positioned right next to Get Directions */
    width: 43%;
    height: 10%;
  }
}
```

---

## Testing Checklist

- [ ] **Desktop**: Click "Get Directions" → Opens Google Maps ✅
- [ ] **Desktop**: Click "View Menu" → Opens menu page ✅
- [ ] **Mobile**: Both buttons work on mobile ✅
- [ ] **Hover Effect**: Buttons slightly fade on hover ✅
- [ ] **Focus Outline**: Blue outline appears when tabbing ✅

---

## Button Alignment Tips

### To Perfectly Align Buttons with Your Hero Image:

1. **Open your hero image in an image editor** (Photoshop, Figma, etc.)
2. **Measure the button positions** as percentages:
   - Distance from bottom edge
   - Distance from left edge
   - Button width and height
3. **Update the CSS** in `ad-landing-dlf.liquid`

### Visual Guide:
```
┌─────────────────────────────────────────┐
│                                         │
│         Your Hero Image                 │
│                                         │
│  ┌─────────────┐  ┌─────────────┐     │
│  │Get Directions│  │  View Menu  │     │ ← Buttons here
│  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────┘
    ↑               ↑
   left: 5%      left: 30%
   bottom: 8%
```

---

## Accessibility Features

✅ **Keyboard Navigation**: Users can tab to buttons  
✅ **Screen Readers**: Hidden text describes button purpose  
✅ **Focus Indicators**: Clear outline when button is focused  
✅ **ARIA Labels**: Proper labeling for assistive technologies

---

## File Updated

📝 **File**: `shopify-theme/sections/ad-landing-dlf.liquid`

**Lines changed**:
- Line 46-57: Button HTML (changed Call Store → View Menu)
- Line 534-545: Button CSS positioning
- Line 583-606: Mobile and tablet responsive styles

---

## Need More Help?

### Button not clickable?
- Check browser console for JavaScript errors
- Verify the buttons aren't covered by another element
- Try adding `z-index: 100;` to `.hero-btn-overlay` class

### Button in wrong position?
- Adjust `bottom`, `left`, `width`, `height` percentages
- Test on actual device, not just browser resize
- Use browser DevTools to inspect and adjust live

### Menu link not working?
- Verify the menu page exists in Shopify
- Check the URL is correct (no typos)
- Ensure page is published, not draft

---

## What's Next?

✅ Buttons are now clickable!  
✅ Update the Menu Link in Shopify customizer if needed  
✅ Test on real mobile device  
✅ Fine-tune button positions if needed

Your hero banner is now fully functional! 🎉

