const express = require('express');
const router = express.Router();

/**
 * Location Landing Pages Router
 * Handles deeply nested location URLs for ad campaigns
 * Redirects to Shopify landing page
 */

// Get Shopify domain from environment or use default
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_URL || 'https://mycoffeeco.com';

console.log('[Locations Router] Loaded. SHOPIFY_DOMAIN:', SHOPIFY_DOMAIN);

/**
 * App Proxy Route - Shopify strips /a/locations prefix
 * When user visits: /a/locations/gurgaon/dlf-cyber-city/building-14
 * Shopify sends to proxy: /gurgaon/dlf-cyber-city/building-14
 * Redirects to: /pages/ad-landing-page
 */
router.get('/:param1/:param2/:param3', (req, res, next) => {
  const { param1, param2, param3 } = req.params;
  
  // Only handle if it looks like a location path (lowercase with hyphens)
  const isLocationPath = /^[a-z0-9-]+$/.test(param1) && 
                         /^[a-z0-9-]+$/.test(param2) && 
                         /^[a-z0-9-]+$/.test(param3);
  
  if (isLocationPath) {
    const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
    console.log(`[Locations] App Proxy redirect → ${shopifyPageUrl} (path: ${param1}/${param2}/${param3})`);
    return res.redirect(301, shopifyPageUrl);
  }
  
  // Not a location path, pass to next handler
  next();
});

/**
 * Direct Location URL (not through App Proxy)
 * URL: /locations/gurgaon/dlf-cyber-city/building-14
 * Redirects to: /pages/ad-landing-page
 */
router.get('/locations/:city/:area/:building', (req, res) => {
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
  console.log(`[Locations] Direct route redirect → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
});

/**
 * 3-Level Location URL
 * URL: /locations/gurgaon/dlf-cyber-city
 */
router.get('/locations/:city/:area', (req, res) => {
  const { city, area } = req.params;
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/locations-${city}-${area}`;
  console.log(`[Locations] 3-level → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
});

/**
 * City-Specific Locations Page
 * URL: /locations/gurgaon
 */
router.get('/locations/:city', (req, res) => {
  const city = req.params.city;
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/locations-${city}`;
  console.log(`[Locations] City page → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
});

/**
 * All Locations Index Page
 * URL: /locations
 */
router.get('/locations', (req, res) => {
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/locations`;
  console.log(`[Locations] Index page → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
});

module.exports = router;
