# Your Exact URL: mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14

## ✅ Solution Implemented

Your middleware now supports this **exact 4-level nested URL structure**.

---

## 🔄 How It Works

```
User clicks ad:
  https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
              ↓
  (Middleware intercepts via Shopify App Proxy)
              ↓
  Middleware redirects (301) to:
  https://mycoffeeco.com/pages/locations-gurgaon-dlf-cyber-city-building-14
              ↓
  Shopify serves your ad landing page
              ↓
  User sees: Beautiful landing page with hero banner, store info, etc.
```

---

## 📝 Step-by-Step Setup

### 1. Add Environment Variable

Add to your `.env` file:
```env
SHOPIFY_STORE_URL=https://mycoffeeco.com
```

### 2. Create Shopify Page

1. Go to: **Online Store > Pages > Add page**
2. **Title**: `Building 14 - DLF Cyber City`
3. **URL handle**: `locations-gurgaon-dlf-cyber-city-building-14`
   - ⚠️ Note: Use dashes, not slashes (Shopify limitation)
4. **SEO Settings** (scroll down):
   - Click "Edit website SEO"
   - ✅ Check "Hide this page from search engines"
5. **Save** the page

### 3. Add Landing Section

1. Click **Customize** on the page
2. Remove any default sections
3. Click **Add section** → Select **"Ad Landing - DLF"**
4. Configure all settings:
   - Upload mobile & desktop hero banners
   - Add store info (lat/long, phone, hours)
   - Upload product card images
   - Upload signature drink photos
   - Add social proof images
5. **Save**

### 4. Deploy Middleware

```bash
git add .
git commit -m "Add 4-level nested location URL support"
git push origin main
```

Render will auto-deploy (takes 2-3 minutes).

### 5. Test the Redirect

After deployment, test:
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

Check Render logs - you should see:
```
[Locations] 4-level deep → https://mycoffeeco.com/pages/locations-gurgaon-dlf-cyber-city-building-14
```

### 6. Configure Shopify App Proxy (CRITICAL)

For the clean URL to work on your main domain, you need to set up App Proxy:

#### Option A: Create Shopify App + App Proxy

1. **Go to**: [Shopify Partners Dashboard](https://partners.shopify.com)
2. **Create app** (or use existing):
   - App name: "My Coffee Co Middleware"
   - App URL: Your middleware URL
3. **Configure App Proxy**:
   - Go to app settings → App Proxy
   - **Subpath prefix**: `locations`
   - **Subpath**: (leave empty)
   - **Proxy URL**: `https://YOUR-MIDDLEWARE.onrender.com`
4. **Install** the app to your Shopify store
5. **Test**: `https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14`

#### Option B: Use Middleware URL Directly (Simpler, No App Needed)

If you don't want to set up App Proxy, use the middleware URL directly in your ads:
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

This works immediately after deployment, no additional setup needed.

---

## 🧪 Local Testing (Before Deployment)

Test locally before deploying:

```bash
# Make sure .env has SHOPIFY_STORE_URL set
node test-location-redirect.js
```

Then visit in your browser:
```
http://localhost:3001/locations/gurgaon/dlf-cyber-city/building-14
```

You should be redirected to:
```
https://mycoffeeco.com/pages/locations-gurgaon-dlf-cyber-city-building-14
```

---

## 📋 Complete Checklist

### Middleware
- [ ] `.env` has `SHOPIFY_STORE_URL=https://mycoffeeco.com`
- [ ] Code deployed to Render
- [ ] Test redirect URL works

### Shopify Page
- [ ] Page created with URL: `locations-gurgaon-dlf-cyber-city-building-14`
- [ ] "Hide from search engines" enabled in SEO settings
- [ ] "Ad Landing - DLF" section added
- [ ] Hero images uploaded (mobile + desktop)
- [ ] Store info configured
- [ ] All product/drink images uploaded
- [ ] Page published (not draft)

### Domain Routing
- [ ] Shopify App Proxy configured (for mycoffeeco.com domain)
  - OR -
- [ ] Using middleware URL directly in ads

### Testing
- [ ] Middleware redirect URL works
- [ ] Shopify page displays correctly
- [ ] All images load
- [ ] "Get Directions" button works
- [ ] "Call Store" button works
- [ ] Page hidden from Google (check robots meta tag)

---

## 🎯 Final URLs

After App Proxy setup:

**Ad URL** (clean, what users see):
```
https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
```

**Actual Shopify page** (backend):
```
https://mycoffeeco.com/pages/locations-gurgaon-dlf-cyber-city-building-14
```

**Middleware redirect** (if App Proxy not set up):
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

---

## 🔒 SEO & Crawler Blocking

Your page is hidden from search engines by:

1. ✅ `<meta name="robots" content="noindex, nofollow">` in section code
2. ✅ "Hide from search engines" in Shopify page settings
3. ✅ Not linked from site navigation
4. ✅ Excluded from sitemap

**Result**: Only accessible via direct URL (from ads). Google won't index it.

---

## 🚀 Scaling to More Locations

The middleware automatically supports any 4-level URL pattern:

```
/locations/:city/:area/:building
```

**Examples that work automatically:**

| Clean URL | Shopify Page Handle |
|-----------|-------------------|
| `/locations/gurgaon/dlf-cyber-city/building-14` | `locations-gurgaon-dlf-cyber-city-building-14` |
| `/locations/gurgaon/dlf-cyber-city/building-15` | `locations-gurgaon-dlf-cyber-city-building-15` |
| `/locations/mumbai/bkc/tower-a` | `locations-mumbai-bkc-tower-a` |
| `/locations/bangalore/koramangala/block-5` | `locations-bangalore-koramangala-block-5` |

**To add a new location:**
1. Create new Shopify page with handle: `locations-{city}-{area}-{building}`
2. Add "Ad Landing - DLF" section
3. Configure for new location
4. ✅ Redirect works automatically!

---

## ⚠️ Important Notes

### App Proxy is Required for Clean Domain URLs

Without App Proxy:
- ❌ `mycoffeeco.com/locations/...` won't work
- ✅ `YOUR-MIDDLEWARE.onrender.com/locations/...` will work

With App Proxy:
- ✅ Both URLs work
- ✅ `mycoffeeco.com/locations/...` is cleaner for ads

### Alternative: Use Middleware URL in Ads

If setting up App Proxy is too complex, just use:
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

It's longer, but:
- Works immediately
- No Shopify App needed
- Same functionality
- Most ad platforms shorten URLs anyway

---

## 🐛 Troubleshooting

### "Page not found" error?
- Check Shopify page exists with correct handle
- Ensure page is **published**, not draft
- Verify middleware is deployed and running

### Redirect not working?
- Check `SHOPIFY_STORE_URL` in `.env`
- View Render logs for redirect messages
- Test middleware URL directly first

### Clean domain URL not working?
- Verify App Proxy is configured
- Check App Proxy subpath is `locations`
- Ensure app is installed to your store
- Try middleware URL directly to rule out Shopify issue

### Images not showing in customizer?
- Save section file
- Close and reopen customizer
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

---

## 📞 Your Exact Setup

**Your desired URL:**
```
https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
```

**Shopify page to create:**
- Handle: `locations-gurgaon-dlf-cyber-city-building-14`
- Title: `Building 14 - DLF Cyber City`
- Hide from search: ✅ Yes

**Middleware route:**
- Pattern: `/locations/:city/:area/:building`
- Redirects to: `/pages/locations-{city}-{area}-{building}`

---

## ✅ Ready to Deploy!

Everything is configured for your exact URL structure. Follow the steps above to go live!

---

**Questions?**
- Check Render logs for debugging
- Review `QUICK_START_LOCATION_PAGES.txt` for quick reference
- See `LOCATION_LANDING_SETUP.md` for detailed guide
