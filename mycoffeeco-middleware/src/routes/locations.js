const express = require('express');
const router = express.Router();

/**
 * Location & Custom Page Landing Router
 * Handles location URLs, proxy paths, and custom page form submissions (e.g. happy_moments)
 */

// Get Shopify domain from environment or use default
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_URL || 'https://mycoffeeco.com';

console.log('[Locations Router] Loaded. SHOPIFY_DOMAIN:', SHOPIFY_DOMAIN);

const { shopifyPost } = require('../clients/shopifyClient');

// Helper slug regex allowing lowercase alphanumeric, hyphens, and underscores
const isValidSlug = (str) => typeof str === 'string' && /^[a-z0-9_-]+$/i.test(str);

/**
 * Specific GET & POST handler for Happy Moments page / form submission
 * URL: /pages/happy_moments or /happy_moments
 */
const handleHappyMoments = async (req, res) => {
  if (req.method === 'POST') {
    const formData = req.body || {};
    console.log('[Happy Moments Form Submitted]:', formData);

    // Dispatch lead email notification to social@mycoffeeco.com
    try {
      console.log('[Happy Moments] Forwarding lead notification email to social@mycoffeeco.com...');
      await fetch('https://formsubmit.co/ajax/social@mycoffeeco.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://mycoffeeco.com'
        },
        body: JSON.stringify({
          _subject: '🎉 New Happy Moments Form Lead Inquiry - My Coffee Co.',
          _template: 'table',
          ...formData
        })
      });
      console.log('[Happy Moments] Email notification sent to social@mycoffeeco.com successfully!');
    } catch (emailErr) {
      console.error('[Happy Moments] Email dispatch error (non-fatal):', emailErr.message);
    }

    // Sync inquiry to Shopify Admin API if configured
    if (process.env.SHOPIFY_STORE && process.env.SHOPIFY_ACCESS_TOKEN) {
      try {
        const nameParts = (formData.name || formData.first_name || 'Happy Moments Inquiry').trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Customer';
        const email = formData.email || undefined;
        const phone = formData.phone ? `+91${formData.phone.replace(/^\+?91/, '').replace(/\D/g, '').slice(-10)}` : undefined;
        const note = formData.note || formData.message || formData.event_details || `Happy Moments inquiry: ${JSON.stringify(formData)}`;

        console.log('[Happy Moments] Syncing inquiry to Shopify Admin...');
        await shopifyPost('/customers.json', {
          customer: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            note: note,
            tags: 'happy_moments, event_inquiry'
          }
        });
        console.log('[Happy Moments] Successfully synced inquiry to Shopify Admin!');
      } catch (err) {
        console.error('[Happy Moments] Failed to sync to Shopify Admin API (non-fatal):', err.message);
      }
    } else {
      console.log('[Happy Moments] Shopify credentials not set in .env — skipping Shopify API sync');
    }
    
    // Check if client expects JSON (e.g., AJAX submit)
    if (req.xhr || req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json')) {
      return res.json({
        success: true,
        message: 'Thank you! Your happy moment inquiry has been submitted successfully.',
        data: formData
      });
    }

    // Standard HTML form POST redirect back to Shopify happy_moments page with success flag
    const redirectUrl = `${SHOPIFY_DOMAIN}/pages/happy_moments?submitted=true`;
    return res.redirect(303, redirectUrl);
  }

  // GET request redirect to Shopify storefront page
  const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/happy_moments`;
  console.log(`[Happy Moments] GET redirect → ${shopifyPageUrl}`);
  res.redirect(301, shopifyPageUrl);
};

router.get('/pages/happy_moments', handleHappyMoments);
router.post('/pages/happy_moments', handleHappyMoments);
router.get('/happy_moments', handleHappyMoments);
router.post('/happy_moments', handleHappyMoments);
router.get('/contact', handleHappyMoments);
router.post('/contact', handleHappyMoments);

/**
 * App Proxy Route - 3 Level Parameters
 * Example: /a/locations/gurgaon/dlf-cyber-city/building-14
 */
router.get('/:param1/:param2/:param3', (req, res, next) => {
  const { param1, param2, param3 } = req.params;
  
  const isLocationPath = isValidSlug(param1) && isValidSlug(param2) && isValidSlug(param3);
  
  if (isLocationPath) {
    const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/ad-landing-page`;
    console.log(`[Locations] App Proxy redirect → ${shopifyPageUrl} (path: ${param1}/${param2}/${param3})`);
    return res.redirect(301, shopifyPageUrl);
  }
  
  next();
});

/**
 * App Proxy / Nested Route - 2 Level Parameters
 * Example: /pages/happy_moments or /locations/gurgaon
 */
router.all('/:param1/:param2', (req, res, next) => {
  const { param1, param2 } = req.params;

  if (param1.toLowerCase() === 'pages' && param2.toLowerCase() === 'happy_moments') {
    return handleHappyMoments(req, res);
  }

  if (param1.toLowerCase() === 'locations') {
    const shopifyPageUrl = `${SHOPIFY_DOMAIN}/pages/locations-${param2}`;
    console.log(`[Locations] 2-level → ${shopifyPageUrl}`);
    return res.redirect(301, shopifyPageUrl);
  }

  next();
});

/**
 * Direct Location URL (not through App Proxy)
 * URL: /locations/gurgaon/dlf-cyber-city/building-14
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

