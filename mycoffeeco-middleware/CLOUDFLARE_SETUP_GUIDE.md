# Cloudflare Setup Guide - Clean URL Without Redirect

## 🎯 Goal
Get `https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14` to work **WITHOUT redirecting** the URL in the browser.

---

## ✅ Current Status

- ✅ Cloudflare account created
- ✅ Domain added to Cloudflare
- ✅ Cloudflare assigned nameservers:
  - `achiel.ns.cloudflare.com`
  - `raegan.ns.cloudflare.com`
- ⏳ **YOU ARE HERE** → Need to update nameservers at GoDaddy

---

## 📝 Step 1: Update Nameservers at GoDaddy (15 minutes)

### A. Turn OFF DNSSEC First (IMPORTANT!)

1. **Log in to GoDaddy**: https://account.godaddy.com
2. **Go to**: My Products → Domains
3. **Click on**: `mycoffeeco.com`
4. **Scroll down** to "Additional Settings"
5. **Find**: "DNSSEC" section
6. **Click**: "Manage"
7. **Turn OFF** DNSSEC if it's enabled
   - ⚠️ If you skip this, nameserver change will fail!
8. **Wait 5 minutes** after disabling DNSSEC

### B. Change Nameservers

1. Still on the domain page
2. **Find**: "Nameservers" section
3. **Click**: "Change"
4. **Select**: "I'll use my own nameservers"
5. **Enter** Cloudflare nameservers:
   ```
   achiel.ns.cloudflare.com
   raegan.ns.cloudflare.com
   ```
6. **Delete** old nameservers:
   - `ns25.domaincontrol.com` ❌
   - `ns26.domaincontrol.com` ❌
7. **Click**: "Save"

### C. Confirm in Cloudflare

1. **Go back to Cloudflare** (the tab where you saw nameserver instructions)
2. **Click**: "Done, check nameservers" or "I updated my nameservers"
3. **Wait** for Cloudflare to verify (can take a few minutes)

---

## ⏳ Step 2: Wait for DNS Propagation (1-48 hours, usually 2-4 hours)

### What's happening?
The internet needs to learn about your new nameservers. This takes time.

### How to check if it's ready?

**Option A: Cloudflare Dashboard**
- Go to Cloudflare → DNS → Overview
- Look for "Status: Active" (green checkmark)
- While waiting, it will say "Pending Nameserver Update"

**Option B: Online DNS Checker**
- Visit: https://www.whatsmydns.net/
- Enter: `mycoffeeco.com`
- Select: "NS" record type
- Click: "Search"
- When you see Cloudflare nameservers everywhere = READY! ✅

### Typical Timeline:
- ⏱️ 1-2 hours: Some locations show new nameservers
- ⏱️ 2-4 hours: Most locations updated
- ⏱️ 24-48 hours: 100% propagated worldwide

**DO NOT proceed to Step 3 until DNS is active!**

---

## 🚀 Step 3: Create Cloudflare Worker (10 minutes)

### ⚠️ Only do this AFTER Cloudflare shows "Active" status!

### A. Create the Worker

1. **Go to**: Cloudflare dashboard → Your domain
2. **Click**: "Workers & Pages" (left sidebar)
3. **Click**: "Create application" button
4. **Select**: "Create Worker"
5. **Name it**: `location-proxy` (or any name you like)
6. **Click**: "Deploy"

### B. Add Worker Code

1. After deployment, **click**: "Edit code"
2. **Replace ALL code** with this:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Only handle /locations/* URLs
    if (!url.pathname.startsWith('/locations/')) {
      // Pass through to Shopify for all other URLs
      return fetch(request);
    }
    
    // Extract the location path
    // Example: /locations/gurgaon/dlf-cyber-city/building-14
    const locationPath = url.pathname;
    
    // Define target Shopify page URL
    const shopifyPageUrl = 'https://mycoffeeco.com/pages/ad-landing-page';
    
    // Fetch the actual page content from Shopify
    const shopifyResponse = await fetch(shopifyPageUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body,
    });
    
    // Get the HTML content
    let html = await shopifyResponse.text();
    
    // Optional: Replace canonical URL in HTML to keep clean URL
    html = html.replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="https://mycoffeeco.com${locationPath}">`
    );
    
    // Return the HTML with clean URL (no redirect!)
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
```

3. **Click**: "Save and Deploy"

### C. Add Worker Route

1. **Go back** to Cloudflare dashboard
2. **Click**: "Workers & Pages" → "Overview"
3. **Click** on your worker (`location-proxy`)
4. **Click**: "Settings" tab
5. **Scroll down** to "Triggers" section
6. **Click**: "Add route"
7. **Enter route**:
   ```
   mycoffeeco.com/locations/*
   ```
8. **Select zone**: `mycoffeeco.com`
9. **Select worker**: `location-proxy`
10. **Click**: "Add route"

---

## 🧪 Step 4: Test the Final URL

After completing all steps above, test:

### Test URL:
```
https://mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14
```

### Expected Result:
- ✅ Landing page loads correctly
- ✅ URL stays as `/locations/gurgaon/dlf-cyber-city/building-14`
- ✅ **NO redirect** to `/pages/ad-landing-page`
- ✅ All images, buttons work
- ✅ Browser address bar doesn't change

### If it doesn't work:
1. Wait another hour (DNS might not be fully propagated)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private browsing mode
4. Check Cloudflare Workers logs for errors
5. Verify Worker route is added correctly

---

## 📋 Complete Checklist

### At GoDaddy:
- [ ] DNSSEC disabled
- [ ] Nameservers changed to Cloudflare
- [ ] Changes saved

### DNS Propagation:
- [ ] Cloudflare shows "Active" status
- [ ] whatsmydns.net shows Cloudflare nameservers

### Cloudflare Worker:
- [ ] Worker created (`location-proxy`)
- [ ] Worker code added and deployed
- [ ] Worker route added: `mycoffeeco.com/locations/*`

### Testing:
- [ ] Test URL loads without redirect
- [ ] All page content displays correctly
- [ ] URL stays clean in browser

---

## 🎯 Why This Works

**Before (App Proxy):**
```
User visits: /locations/gurgaon/dlf-cyber-city/building-14
         ↓
Shopify App Proxy sends to middleware
         ↓
Middleware sends 301 redirect to /pages/ad-landing-page
         ↓
Browser changes URL ❌
```

**After (Cloudflare Worker):**
```
User visits: /locations/gurgaon/dlf-cyber-city/building-14
         ↓
Cloudflare Worker intercepts request
         ↓
Worker fetches content from /pages/ad-landing-page
         ↓
Worker returns HTML with original URL ✅
         ↓
Browser keeps clean URL! 🎉
```

---

## 💡 Key Benefits

1. ✅ **Clean URL** - No redirect, URL stays beautiful
2. ✅ **SEO Safe** - Page still hidden from search engines
3. ✅ **Fast** - Cloudflare edge network serves content
4. ✅ **Scalable** - Works for any `/locations/*` URL pattern
5. ✅ **Professional** - Perfect for ad campaigns

---

## 🔧 Troubleshooting

### "This site can't be reached"
- **Cause**: DNS not propagated yet
- **Solution**: Wait longer, check whatsmydns.net

### Worker showing error
- **Cause**: Code syntax error
- **Solution**: Copy the code again carefully, ensure no extra characters

### Worker not triggering
- **Cause**: Route not added or incorrect pattern
- **Solution**: Verify route is `mycoffeeco.com/locations/*` exactly

### Page loads but redirects anyway
- **Cause**: Worker code not deployed
- **Solution**: Click "Save and Deploy" in Worker editor

### Images not loading
- **Cause**: Shopify page not published or incomplete
- **Solution**: Check Shopify page is published and has landing section

---

## 🎉 Success!

When everything works, you'll have:

✅ Beautiful URL: `mycoffeeco.com/locations/gurgaon/dlf-cyber-city/building-14`
✅ No redirect - URL stays clean
✅ Loads your ad landing page content
✅ Perfect for Meta/Google Ads campaigns
✅ Hidden from search engines

---

## 📞 Next Steps After Setup

1. **Test thoroughly** on mobile and desktop
2. **Update your ad campaigns** with the clean URL
3. **Track performance** - URL looks professional for users
4. **Create more locations** - Same Worker handles all `/locations/*` URLs

---

**Questions or issues?**
- Check Cloudflare Workers logs
- Verify DNS is fully active
- Test in incognito mode to avoid cache issues

