const express = require('express');
const router = express.Router();

/**
 * Location Landing Pages Router
 * Handles deeply nested location URLs for ad campaigns
 * 
 * Supported URL structures:
 * /locations
 * /locations/:city
 * /locations/:city/:area
 * /locations/:city/:area/:building
 */

// Get Shopify domain from environment or use default
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_URL || 'https://mycoffeeco.com';

console.log('[Locations Router] Loaded. SHOPIFY_DOMAIN:', SHOPIFY_DOMAIN);

/**
 * Fetch and serve Shopify page content
 */
async function fetchAndServeShopifyPage(req, res, shopifyPageUrl) {
  try {
    // Fetch the page from Shopify
    const response = await fetch(shopifyPageUrl);
    
    if (!response.ok) {
      console.error(`[Locations] Failed to fetch Shopify page: ${response.status}`);
      return res.status(response.status).send('Page not found');
    }
    
    // Get the HTML content
    let html = await response.text();
    
    // Remove any canonical URLs that point to the Shopify page
    html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
    
    // Remove any meta redirects
    html = html.replace(/<meta[^>]+http-equiv=["']refresh["'][^>]*>/gi, '');
    
    // Remove any JavaScript redirects (common patterns)
    html = html.replace(/window\.location\.href\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/window\.location\.replace\([^)]*\)/gi, '');
    html = html.replace(/window\.location\s*=\s*["'][^"']*["']/gi, '');
    
    // Fix any absolute URLs pointing to /pages/ to point to /a/locations/
    // (Uncomment if you have links within the page that should stay on the clean URL)
    // html = html.replace(/href=["']\/pages\/ad-landing-page["']/gi, `href="/a/locations/${req.params.param1}/${req.params.param2}/${req.params.param3}"`);
    
    // Serve the HTML with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
    
    console.log(`[Locations] Served page from: ${shopifyPageUrl}`);
  } catch (error) {
    console.error(`[Locations] Error fetching page:`, error);
    res.status(500).send('Error loading page');
  }
}

/**
 * App Proxy Route - Shopify strips /a/locations prefix
 * When user visits: /a/locations/gurgaon/dlf-cyber-city/building-14
 * Shopify sends to proxy: /gurgaon/dlf-cyber-city/building-14
 */
router.get('/:param1/:param2/:param3', async (req, res, next) => {
  const { param1, param2, param3 } = req.params;
  
  // Only handle if it looks like a location path (lowercase with hyphens)
  const isLocationPath = /^[a-z0-9-]+$/.test(param1) && 
                         /^[a-z0-9-]+$/.test(param2) && 
                         /^[a-z0-9-]+$/.test(param3);
  
  if (isLocationPath) {
    const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
    console.log(`[Locations] App Proxy serving page (path: ${param1}/${param2}/${param3})`);
    return await fetchAndServeShopifyPage(req, res, shopifyPageUrl);
  }
  
  // Not a location path, pass to next handler (404)
  next();
});

/**
 * Direct Location URL (not through App Proxy)
 * URL: /locations/gurgaon/dlf-cyber-city/building-14
 * Redirects to: /pages/ad-landing-page
 */
router.get('/locations/:city/:area/:building', async (req, res) => {
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
  console.log(`[Locations] Direct route serving page`);
  await fetchAndServeShopifyPage(req, res, shopifyPageUrl);
});

/**
 * 3-Level Location URL
 * URL: /locations/gurgaon/dlf-cyber-city
 * Redirects to: /pages/locations-gurgaon-dlf-cyber-city
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
 * Redirects to: /pages/locations-gurgaon
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
 * Redirects to: /pages/locations
 */
router.get('/locations', (req, res) => {
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/locations`;
  console.log(`[Locations] Index page → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
});

module.exports = router;
