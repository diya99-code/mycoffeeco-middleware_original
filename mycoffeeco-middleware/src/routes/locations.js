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
 * 4-Level Deep Location URL
 * URL: /locations/gurgaon/dlf-cyber-city/building-14
 * Redirects to: /pages/ad-landing-page
 */
router.get('/locations/:city/:area/:building', (req, res) => {
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
  console.log(`[Locations] Building landing page → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
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
