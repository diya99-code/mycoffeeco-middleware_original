═══════════════════════════════════════════════════════════════════════════
                    CLEAN URL FOR AD LANDING PAGE - READY!
═══════════════════════════════════════════════════════════════════════════

✅ WHAT'S CONFIGURED:

Your ad URL:
  https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14

Redirects to:
  https://mycoffeeco.com/pages/ad-landing-page

───────────────────────────────────────────────────────────────────────────

📝 DEPLOYMENT STEPS:

1. Add to .env file:
   SHOPIFY_STORE_URL=https://mycoffeeco.com

2. Ensure Shopify page exists:
   URL: /pages/ad-landing-page
   SEO: "Hide from search engines" enabled

3. Deploy:
   git add .
   git commit -m "Add clean location URL redirect"
   git push origin main

───────────────────────────────────────────────────────────────────────────

🔗 URL OPTIONS:

Option A - With App Proxy (after setup):
  https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14

Option B - Direct middleware (works immediately):
  https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14

Both redirect to: /pages/ad-landing-page

───────────────────────────────────────────────────────────────────────────

🧪 TEST AFTER DEPLOYMENT:

Visit:
  https://YOUR-MIDDLEWARE.onrender.com/locations/gurgaon/dlf-cyber-city/building-14

Should redirect to:
  https://mycoffeeco.com/pages/ad-landing-page

Check Render logs for:
  [Locations] Building landing page → https://mycoffeeco.com/pages/ad-landing-page

───────────────────────────────────────────────────────────────────────────

📋 FOR APP PROXY SETUP (Optional - for clean domain URL):

1. Go to: https://partners.shopify.com
2. Create/open your app
3. App Proxy settings:
   - Subpath prefix: locations
   - Proxy URL: https://YOUR-MIDDLEWARE.onrender.com
4. Install app to your store

───────────────────────────────────────────────────────────────────────────

✅ READY TO DEPLOY!

Read SIMPLE_SETUP.md for details.
