# Simple Setup: Clean URL for Your Ad Landing Page

## Goal
Make this URL work:
```
https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
```

Redirect to your existing page:
```
https://mycoffeeco.com/pages/ad-landing-page
```

---

## Quick Setup (3 Steps)

### 1. Add to `.env`
```env
SHOPIFY_STORE_URL=https://mycoffeeco.com
```

### 2. Make sure your Shopify page exists
- Go to: **Online Store > Pages**
- Verify page exists with URL handle: `ad-landing-page`
- Enable **"Hide from search engines"** in SEO settings

### 3. Deploy middleware
```bash
git add .
git commit -m "Add location URL redirect to ad landing page"
git push origin main
```

---

## How to Use

### Option A: With Shopify App Proxy (Clean Domain URL)

**Setup App Proxy** (one-time):
1. Create Shopify app in Partners dashboard
2. Configure App Proxy:
   - Subpath prefix: `locations`
   - Proxy URL: Your Render middleware URL
3. Install app to your store

**Result**: Use this URL in ads:
```
https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
```

### Option B: Direct Middleware URL (No App Proxy Needed)

Use this URL in ads (works immediately after deployment):
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

Both redirect to the same page: `/pages/ad-landing-page`

---

## Testing

After deployment, test:
```
https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14
```

You should be redirected to:
```
https://mycoffeeco.com/pages/ad-landing-page
```

---

## That's It!

- ✅ Middleware updated
- ✅ Redirects to your existing page
- ✅ Works with any `/locations/:city/:area/:building` pattern
- ✅ Page hidden from search engines (noindex meta tag already in section)

Just deploy and use the URL in your ads!
