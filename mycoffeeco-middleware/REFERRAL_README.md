# Referral System - Implementation Summary

## ✅ What Has Been Implemented

### Backend (Middleware)

1. **Referral Model** (`src/models/referralModel.js`)
   - In-memory storage for referral codes
   - Tracks orders, revenue, and commissions
   - Pre-loaded with 2 test codes: STAFF001, PARTNER01

2. **Referral Controller** (`src/controllers/referralController.js`)
   - Create, read, update, delete referral codes
   - Validate codes
   - Export CSV reports
   - View statistics

3. **Referral Routes** (`src/routes/referrals.js`)
   - API endpoints at `/api/referrals`

4. **Order Integration** (`src/services/orderService.js`)
   - Automatically extracts referral code from Shopify orders
   - Tracks orders to referral codes
   - Calculates commissions

5. **App Integration** (`src/app.js`)
   - Routes registered
   - CORS enabled for API access

### Frontend (Shopify Theme)

1. **Referral Tracker** (`shopify-theme/snippets/referral-tracker.liquid`)
   - Captures `?ref=CODE` from URL
   - Validates code with API
   - Stores in localStorage (30-day expiry)
   - Shows banner notification
   - Injects code into checkout
   - Auto-adds to cart attributes

2. **Admin Dashboard** (`shopify-theme/sections/referral-admin.liquid`)
   - Summary cards (orders, revenue, commission)
   - Create new referral codes
   - List all referrals
   - View detailed statistics
   - Export CSV reports
   - Search and filter

### Documentation

1. **Full Guide** (`REFERRAL_SYSTEM_DOCUMENTATION.md`)
   - Complete architecture explanation
   - All API endpoints documented
   - Frontend integration steps
   - Testing procedures
   - Troubleshooting guide

2. **Quick Start** (`REFERRAL_QUICK_START.md`)
   - 5-minute setup instructions
   - Common commands
   - Testing flow
   - Payment workflow

3. **Test Script** (`test-referral-system.ps1`)
   - Automated testing of all endpoints

## 🎯 How It Works

```
1. Admin creates referral code
   ↓
2. Share link: https://mycoffeeco.myshopify.com/pages/menu?ref=STAFF001
   ↓
3. Customer clicks link
   ↓
4. Code captured and stored (30 days)
   ↓
5. Customer browses and adds to cart
   ↓
6. Customer checks out
   ↓
7. Code automatically included in order
   ↓
8. Order webhook fires
   ↓
9. Middleware tracks order to referral
   ↓
10. Admin views stats and pays commission
```

## 🚀 Deployment Steps

### 1. Deploy Backend (Already Ready)

```bash
cd mycoffeeco-middleware
git add .
git commit -m "Add referral system"
git push origin master
```

Render will auto-deploy. No new environment variables needed.

### 2. Deploy Frontend

**A. Add Referral Tracker:**
1. Shopify Admin → Themes → Edit Code
2. Snippets → Add new snippet: `referral-tracker`
3. Paste content from `shopify-theme/snippets/referral-tracker.liquid`
4. Save
5. Open `theme.liquid` (Layout folder)
6. Before `</body>`, add: `{% render 'referral-tracker' %}`
7. Save

**B. Add Admin Dashboard (Optional):**
1. Sections → Add new section: `referral-admin`
2. Paste content from `shopify-theme/sections/referral-admin.liquid`
3. Save
4. Pages → Add page: "Referral Admin"
5. Template: referral-admin
6. Save

### 3. Test It

```powershell
# Run test script
.\test-referral-system.ps1

# Or manually test
curl https://mycoffeeco-middleware-original.onrender.com/api/referrals
```

## 📊 API Endpoints

Base URL: `https://mycoffeeco-middleware-original.onrender.com/api/referrals`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new referral |
| GET | `/` | List all referrals |
| GET | `/validate/:code` | Validate a code |
| GET | `/:code` | Get stats for code |
| PUT | `/:code` | Update referral |
| DELETE | `/:code` | Delete referral |
| GET | `/:code/export` | Export CSV |

## 🧪 Quick Test

### Create Your First Referral

```bash
curl -X POST https://mycoffeeco-middleware-original.onrender.com/api/referrals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Store Manager",
    "email": "manager@mycoffeeco.com",
    "type": "staff",
    "commission": 5
  }'
```

Response will include:
- `code`: The generated code (e.g., "STA5F8G9H")
- `referralLink`: The shareable URL

### Test the Link

1. Copy the `referralLink`
2. Open in incognito browser
3. Check console: Should see "Code stored"
4. Place an order
5. Check stats:
```bash
curl https://mycoffeeco-middleware-original.onrender.com/api/referrals/STA5F8G9H
```

## 💡 Use Cases

### Staff Referrals
```bash
# Create codes for each employee
curl -X POST .../api/referrals -d '{
  "name": "John Doe",
  "email": "john@mycoffeeco.com",
  "type": "staff",
  "commission": 5,
  "code": "JOHN5"
}'
```

### Corporate Partners
```bash
curl -X POST .../api/referrals -d '{
  "name": "Tech Corp",
  "email": "partner@techcorp.com",
  "type": "partner",
  "commission": 10,
  "code": "TECHCORP10"
}'
```

### Influencers
```bash
curl -X POST .../api/referrals -d '{
  "name": "Instagram Influencer",
  "email": "influencer@instagram.com",
  "type": "influencer",
  "commission": 15,
  "code": "INSTA15"
}'
```

## 📈 Tracking & Reporting

### View All Referrals
```bash
curl https://mycoffeeco-middleware-original.onrender.com/api/referrals
```

Returns:
- All referral codes
- Total orders per code
- Total revenue per code
- Commission rates

### View Specific Referral Stats
```bash
curl https://mycoffeeco-middleware-original.onrender.com/api/referrals/STAFF001
```

Returns:
- Detailed order list
- Total commission owed
- Average order value
- Individual order breakdown

### Export for Payment
```bash
# Download CSV
curl -O https://mycoffeeco-middleware-original.onrender.com/api/referrals/STAFF001/export
```

CSV includes:
- Invoice numbers
- Order amounts
- Commission per order
- Customer details
- Timestamps

## 🔒 Security Notes

### Current State
- ✅ Codes validated before tracking
- ✅ Commission calculated server-side
- ❌ No authentication on admin endpoints

### For Production
Add authentication middleware to protect:
- POST `/api/referrals` (create)
- PUT `/api/referrals/:code` (update)
- DELETE `/api/referrals/:code` (delete)

Public endpoints (OK to leave open):
- GET `/api/referrals/validate/:code` (needed by frontend)

## ⚠️ Important Limitations

### In-Memory Storage
- Data stored in RAM
- **Lost on server restart**
- OK for testing and low volume
- For production, migrate to database

### Recommended for Production
Migrate to MongoDB or PostgreSQL when:
- More than 50 referral codes
- High order volume
- Need data persistence
- Server restarts frequently

See `REFERRAL_SYSTEM_DOCUMENTATION.md` for migration guide.

## 📦 Files Added

```
mycoffeeco-middleware/
├── src/
│   ├── models/
│   │   └── referralModel.js           ← NEW
│   ├── controllers/
│   │   └── referralController.js      ← NEW
│   ├── routes/
│   │   └── referrals.js               ← NEW
│   ├── services/
│   │   └── orderService.js            ← MODIFIED
│   └── app.js                         ← MODIFIED

shopify-theme/
├── snippets/
│   └── referral-tracker.liquid        ← NEW
└── sections/
    └── referral-admin.liquid           ← NEW

Documentation:
├── REFERRAL_SYSTEM_DOCUMENTATION.md   ← NEW
├── REFERRAL_QUICK_START.md            ← NEW
├── test-referral-system.ps1           ← NEW
└── REFERRAL_README.md                 ← NEW (this file)
```

## 🎉 Ready to Use!

The referral system is complete and ready for deployment. Follow the deployment steps above, then start creating referral codes and tracking orders.

### Next Steps:

1. **Deploy to Render** (push to GitHub)
2. **Add tracker to Shopify theme**
3. **Create first referral code**
4. **Share the link and test**
5. **View stats and export reports**

---

**Questions?** Check the full documentation or test scripts for detailed examples.
