/**
 * Test script for location landing page redirects
 * Run this to verify redirect logic before deploying
 */

require('dotenv').config();

const express = require('express');
const app = express();

// Import the locations router
const locationRoutes = require('./src/routes/locations');

// Use the routes
app.use('/', locationRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Location redirect test server running',
    shopifyUrl: process.env.SHOPIFY_STORE_URL || 'https://mycoffeeco.com',
    testUrls: [
      'http://localhost:3001/locations/gurgaon/dlf-cyber-city/building-14',
      'http://localhost:3001/locations/gurgaon/dlf-cyber-city',
      'http://localhost:3001/locations/gurgaon',
      'http://localhost:3001/locations'
    ],
    expectedRedirects: {
      '/locations/gurgaon/dlf-cyber-city/building-14': '/pages/locations-gurgaon-dlf-cyber-city-building-14',
      '/locations/gurgaon/dlf-cyber-city': '/pages/locations-gurgaon-dlf-cyber-city',
      '/locations/gurgaon': '/pages/locations-gurgaon',
      '/locations': '/pages/locations'
    }
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`\n🧪 Location Redirect Test Server Running\n`);
  console.log(`Your exact URL is supported!`);
  console.log(`\nTest the 4-level nested URL:`);
  console.log(`  → http://localhost:${PORT}/locations/gurgaon/dlf-cyber-city/building-14`);
  console.log(`\nOther supported URLs:`);
  console.log(`  → http://localhost:${PORT}/locations/gurgaon/dlf-cyber-city`);
  console.log(`  → http://localhost:${PORT}/locations/gurgaon`);
  console.log(`  → http://localhost:${PORT}/locations`);
  console.log(`\nShopify domain: ${process.env.SHOPIFY_STORE_URL || 'https://mycoffeeco.com'}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
