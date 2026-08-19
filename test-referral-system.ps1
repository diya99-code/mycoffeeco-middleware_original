# Test Referral System
# PowerShell script to test all referral endpoints

$BASE_URL = "http://localhost:3000/api/referrals"
# $BASE_URL = "https://mycoffeeco-middleware-original.onrender.com/api/referrals"

Write-Host "=== Testing Referral System ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create a new referral
Write-Host "1. Creating new referral code..." -ForegroundColor Yellow
$newReferral = @{
    name = "Test Influencer"
    email = "influencer@example.com"
    type = "influencer"
    commission = 10
    code = "TESTINF01"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -Body $newReferral -ContentType "application/json"
    Write-Host "✓ Referral created:" -ForegroundColor Green
    Write-Host "  Code: $($response.referral.code)" -ForegroundColor White
    Write-Host "  Link: $($response.referral.referralLink)" -ForegroundColor White
    $testCode = $response.referral.code
} catch {
    Write-Host "✗ Failed to create referral: $_" -ForegroundColor Red
    $testCode = "TESTINF01"
}

Write-Host ""

# Test 2: Get all referrals
Write-Host "2. Fetching all referrals..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Get
    Write-Host "✓ Found $($response.count) referrals:" -ForegroundColor Green
    foreach ($ref in $response.referrals) {
        Write-Host "  - $($ref.code): $($ref.name) ($($ref.type), $($ref.commission)%)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Failed to fetch referrals: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Validate referral code
Write-Host "3. Validating referral code: $testCode" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/validate/$testCode" -Method Get
    if ($response.valid) {
        Write-Host "✓ Code is valid" -ForegroundColor Green
        Write-Host "  Name: $($response.referral.name)" -ForegroundColor White
        Write-Host "  Type: $($response.referral.type)" -ForegroundColor White
    } else {
        Write-Host "✗ Code is invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Validation failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get referral stats
Write-Host "4. Getting referral statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$testCode" -Method Get
    Write-Host "✓ Statistics for $($response.stats.code):" -ForegroundColor Green
    Write-Host "  Total Orders: $($response.stats.totalOrders)" -ForegroundColor White
    Write-Host "  Total Revenue: ₹$($response.stats.totalRevenue)" -ForegroundColor White
    Write-Host "  Total Commission: ₹$($response.stats.totalCommission)" -ForegroundColor White
    Write-Host "  Avg Order Value: ₹$($response.stats.averageOrderValue)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to get stats: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Update referral
Write-Host "5. Updating referral..." -ForegroundColor Yellow
$update = @{
    commission = 12
    active = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$testCode" -Method Put -Body $update -ContentType "application/json"
    Write-Host "✓ Referral updated" -ForegroundColor Green
    Write-Host "  New commission: $($response.referral.commission)%" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to update: $_" -ForegroundColor Red
}

Write-Host ""

# Test 6: Simulate order with referral
Write-Host "6. Testing order with referral code..." -ForegroundColor Yellow
Write-Host "  (This would be done via Shopify order webhook)" -ForegroundColor Gray
Write-Host "  The order webhook will automatically track the referral if 'referral_code' is in note_attributes" -ForegroundColor Gray

Write-Host ""

# Test 7: Export CSV
Write-Host "7. Export CSV report..." -ForegroundColor Yellow
Write-Host "  URL: $BASE_URL/$testCode/export" -ForegroundColor White
Write-Host "  Use browser or wget to download" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start your middleware: node src/app.js" -ForegroundColor White
Write-Host "2. Visit referral link: http://localhost:3000/pages/menu?ref=$testCode" -ForegroundColor White
Write-Host "3. Place an order to test tracking" -ForegroundColor White
Write-Host "4. Check stats again to see the order recorded" -ForegroundColor White
