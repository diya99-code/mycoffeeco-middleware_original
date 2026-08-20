# Location Landing Page Setup Guide

## Overview
This guide explains how to set up location-specific landing pages with clean nested URLs for ad campaigns.

**Example URL Structure:**
- Clean URL (for ads): `https://mycoffeeco.com/location/gurgaon/building-14`
- Actual Shopify page: `https://mycoffeeco.com/pages/location-gurgaon-building-14`

The middleware automatically redirects the clean URL to the Shopify page.

---

## Step 1: Create Shopify Page

1. **Go to Shopify Admin**: Online Store > Pages
2. **Click**: Add page
3. **Fill in details**:
   - **Title**: `Building 14 - DLF Cyber City`
   - **Content**: Leave empty (section handles all content)
   - **URL handle**: `location-gurgaon-building-14`
4. **Save** the page

---

## Step 2: Add Landing Section to Page

1. **Click**: Customize (on the page you just created)
2. **Remove** any default sections
3. **Click**: Add section
4. **Select**: "Ad Landing - DLF"
5. **Configure settings**:
   
   ### Hero Section
   - Upload **Hero Banner - Mobile** (vertical, 800x1200px recommended)
   - Upload **Hero Banner - Desktop** (horizontal, 2000x400px recommended)
   
   ### Store Information
   - **Building Name**: Building 14 • DLF Cyber City
   - **Store Latitude**: 28.4943
   - **Store Longitude**: 77.0868
   - **Phone**: +91 XXXXX XXXXX
   - **Store Hours**: Monday - Friday: 8 AM - 10 PM
   
   ### Product Cards
   - Upload images for 3 product cards
   - Customize titles and descriptions
   
   ### Signature Drinks
   - Upload images for 3 signature drinks
   - Customize names and descriptions
   
   ### Social Proof
   - Upload 3 customer photos
   - Add quotes
   
   ### Final CTA
   - Upload cup photo
   - Customize CTA text

6. **Save** your changes

---

## Step 3: Configure Environment Variable

Add this to your `.env` file:

```env
SHOPIFY_STORE_URL=https://mycoffeeco.com
```

---

## Step 4: Deploy Middleware Update

The following files have been updated/created:
- `src/routes/locations.js` (NEW - handles URL redirects)
- `src/app.js` (UPDATED - includes location routes)
- `.env.example` (UPDATED - documents SHOPIFY_STORE_URL)

### Deploy to Render (or your hosting):

```bash
git add .
git commit -m "Add location landing page redirect route"
git push origin main
```

Render will automatically deploy the changes.

---

## Step 5: Test the Redirect

After deployment completes:

1. **Test the redirect URL**:
   ```
   https://YOUR-MIDDLEWARE-DOMAIN.onrender.com/location/gurgaon/building-14
   ```
   
   This should redirect to:
   ```
   https://mycoffeeco.com/pages/location-gurgaon-building-14
   ```

2. **Check console logs** on Render dashboard to confirm:
   ```
   [Locations] Redirecting to: https://mycoffeeco.com/pages/location-gurgaon-building-14
   ```

---

## Step 6: Configure Domain Routing (IMPORTANT!)

For the clean URL to work on your main domain, you need to route `/location/*` paths to your middleware.

### Option A: Shopify App Proxy (Recommended)
1. Go to Shopify Partners > Your App
2. Add **App Proxy** configuration:
   - **Subpath prefix**: `location`
   - **Subpath**: (leave empty)
   - **Proxy URL**: `https://YOUR-MIDDLEWARE-DOMAIN.onrender.com`

This makes `mycoffeeco.com/location/gurgaon/building-14` route through middleware.

### Option B: Cloudflare Workers (if using Cloudflare)
Create a worker rule to proxy `/location/*` requests to your middleware.

### Option C: Custom Domain Setup
Point a subdomain to your middleware and use that in ads:
- `https://api.mycoffeeco.com/location/gurgaon/building-14`

---

## Step 7: Use in Ad Campaigns

Now you can use this clean URL in your Meta/Google Ads:

```
https://mycoffeeco.com/location/gurgaon/building-14
```

**Benefits:**
- Clean, semantic URL structure
- Easy to remember and type
- Professional appearance
- SEO-friendly format
- Can add more locations easily

---

## Adding More Locations

### Automatic Pattern Matching

The middleware already handles any city/building combination:

**URL Pattern**: `/location/:city/:building`

**Examples:**
- `/location/gurgaon/building-14` → redirects to `/pages/location-gurgaon-building-14`
- `/location/mumbai/tower-1` → redirects to `/pages/location-mumbai-tower-1`
- `/location/bangalore/block-a` → redirects to `/pages/location-bangalore-block-a`

### Steps to Add New Location:
1. Create new Shopify page with URL: `location-{city}-{building}`
2. Add "Ad Landing - DLF" section
3. Configure for new location
4. The redirect will work automatically!

---

## Troubleshooting

### Redirect not working?
- Check middleware is deployed and running
- Verify `SHOPIFY_STORE_URL` in `.env`
- Check Render logs for redirect messages
- Ensure App Proxy or domain routing is configured

### Page shows 404?
- Verify Shopify page exists
- Check URL handle matches pattern: `location-{city}-{building}`
- Ensure page is published (not draft)

### Section not showing?
- Verify section file uploaded to theme
- Clear browser cache
- Try hard refresh (Ctrl+Shift+R)

### Images not uploading in customizer?
- Save the section file
- Close and reopen theme customizer
- Check schema JSON is valid
- Try different browser

---

## Support

For issues or questions:
1. Check Render logs: `https://dashboard.render.com/`
2. Check Shopify theme editor
3. Verify all environment variables are set

---

## URL Structure Reference

| Clean URL (Ads) | Actual Shopify URL | Middleware Route |
|----------------|-------------------|------------------|
| `/location/gurgaon/building-14` | `/pages/location-gurgaon-building-14` | ✓ Active |
| `/location/gurgaon/building-15` | `/pages/location-gurgaon-building-15` | ✓ Auto-matches |
| `/location/mumbai/tower-a` | `/pages/location-mumbai-tower-a` | ✓ Auto-matches |

---

## Next Steps

1. ✅ Middleware updated with redirect route
2. ⏳ Create Shopify page with URL: `location-gurgaon-building-14`
3. ⏳ Upload hero banner images (mobile + desktop)
4. ⏳ Configure all section settings
5. ⏳ Deploy middleware to Render
6. ⏳ Test redirect URL
7. ⏳ Configure domain routing (App Proxy)
8. ⏳ Launch ad campaigns with clean URL

---

**Date Created**: August 20, 2026
**Status**: Ready for deployment
