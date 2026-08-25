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

const nodemailer = require('nodemailer');

const sendLeadEmail = async (targetEmail, subject, payload) => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const htmlRows = Object.entries(payload)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>${k}</strong></td><td style="padding:8px;border:1px solid #ddd;">${v}</td></tr>`)
        .join('');

      const htmlBody = `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto;">
          <h2 style="color:#17214f;">${subject}</h2>
          <table style="width:100%; border-collapse:collapse;">
            ${htmlRows}
          </table>
        </div>
      `;

      await transporter.sendMail({
        from: `"${payload['Full Name'] || 'My Coffee Co'}" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: subject,
        html: htmlBody
      });
      console.log(`[Email Service] Successfully sent email via Nodemailer SMTP to ${targetEmail}`);
      return true;
    } catch (smtpErr) {
      console.error('[Email Service] Nodemailer SMTP failed, trying HTTP fallback:', smtpErr.message);
    }
  }

  // HTTP FormSubmit / Web3Forms Fallback
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://mycoffeeco.com'
      },
      body: JSON.stringify(payload)
    });
    console.log(`[Email Service] FormSubmit API response status: ${res.status}`);
    return true;
  } catch (err) {
    console.error('[Email Service] HTTP email fallback error:', err.message);
    return false;
  }
};

/**
 * Specific GET & POST handler for Happy Moments page / form submission
 * URL: /pages/happy_moments or /happy_moments
 */
const handleHappyMoments = async (req, res) => {
  if (req.method === 'POST') {
    const formData = req.body || {};
    // Extract all Happy Moments Story fields from request body (handles various form field names)
    const name = formData.name || formData['contact[name]'] || formData['contact[Your Name]'] || formData.first_name || 'Coffee Lover';
    const phone = formData.phone || formData['contact[phone]'] || formData['contact[Phone Number]'] || '';
    const socialHandle = formData.social_handle || formData.instagram || formData.handle || formData['contact[social]'] || formData['contact[Your Social Media Handle]'] || 'Not provided';
    const story = formData.story || formData.happy_moment || formData.message || formData['contact[body]'] || formData['contact[Tell us about your happy moment.]'] || 'No story provided';
    const oneWord = formData.one_word_description || formData.mood || formData['contact[one_word]'] || formData['contact[How would you describe it in one word?]'] || '';
    const isAnonymous = formData.anonymous || formData.share_anonymous ? 'Yes' : 'No';

    const subject = `🎉 New Happy Moments Story from ${socialHandle !== 'Not provided' ? socialHandle : name}`;
    const formattedPayload = {
      _subject: subject,
      _template: 'table',
      'Social Handle': socialHandle,
      'Full Name': name,
      'Phone Number': phone ? `+91 ${phone.replace(/^\+?91/, '').replace(/\D/g, '').slice(-10)}` : 'N/A',
      'Happy Moment Story': story,
      'One Word Mood': oneWord || 'N/A',
      'Share Anonymously': isAnonymous
    };

    // Dispatch lead email notification to target email (default: singhsiddhartha220@gmail.com)
    const targetEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'singhsiddhartha220@gmail.com';
    await sendLeadEmail(targetEmail, subject, formattedPayload);

    // Sync inquiry & Social Handle to Shopify Admin API if configured
    if (process.env.SHOPIFY_STORE && process.env.SHOPIFY_ACCESS_TOKEN) {
      try {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Customer';
        const formattedPhone = phone ? `+91${phone.replace(/^\+?91/, '').replace(/\D/g, '').slice(-10)}` : undefined;
        const note = `Social Handle: ${socialHandle}\nOne Word Mood: ${oneWord}\nAnonymous: ${isAnonymous}\n\nStory:\n${story}`;

        console.log('[Happy Moments] Syncing story & social handle to Shopify Admin...');
        await shopifyPost('/customers.json', {
          customer: {
            first_name: firstName,
            last_name: lastName,
            phone: formattedPhone,
            note: note,
            tags: `happy_moments, story_shared, social:${socialHandle}`
          }
        });
        console.log('[Happy Moments] Successfully synced story to Shopify Admin!');
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
router.get('/pages/feedback', handleHappyMoments);
router.post('/pages/feedback', handleHappyMoments);
router.get('/feedback', handleHappyMoments);
router.post('/feedback', handleHappyMoments);

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

