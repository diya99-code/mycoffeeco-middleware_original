# ═══════════════════════════════════════════════════════════════
# TEST SCRIPT: Website Channel Integration
# ═══════════════════════════════════════════════════════════════
# This script tests the complete flow for "Website" channel:
# 1. Menu API (check if items exist)
# 2. Order Creation API (create test order)
# 3. Callback API (verify webhook works)
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

# Configuration
$MIDDLEWARE_URL = "https://mycoffeeco-middleware-original.onrender.com"
$BRANCH = "HO"
$CHANNEL = "Website"
$CALLBACK_SECRET = "mcc-rista-callback-2026"

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  WEBSITE CHANNEL INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Middleware: $MIDDLEWARE_URL" -ForegroundColor Gray
Write-Host "  Branch: $BRANCH" -ForegroundColor Gray
Write-Host "  Channel: $CHANNEL" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# TEST 1: Menu API - Check if Website channel has items
# ═══════════════════════════════════════════════════════════════
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 1: Menu API - Website Channel" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

$menuUrl = "$MIDDLEWARE_URL/api/menu?branch=$BRANCH&channel=$CHANNEL"
Write-Host "📡 Calling: $menuUrl" -ForegroundColor Yellow
Write-Host ""

try {
    $menuResponse = Invoke-RestMethod -Uri $menuUrl -Method Get -ContentType "application/json"
    
    $categoryCount = $menuResponse.categories.Count
    $totalItems = 0
    foreach ($cat in $menuResponse.categories) {
        $totalItems += $cat.items.Count
    }
    
    Write-Host "✅ Menu API Response:" -ForegroundColor Green
    Write-Host "  Success: $($menuResponse.success)" -ForegroundColor Gray
    Write-Host "  Branch: $($menuResponse.branch)" -ForegroundColor Gray
    Write-Host "  Channel: $($menuResponse.channel)" -ForegroundColor Gray
    Write-Host "  Categories: $categoryCount" -ForegroundColor Gray
    Write-Host "  Total Items: $totalItems" -ForegroundColor Gray
    Write-Host ""
    
    if ($categoryCount -eq 0 -or $totalItems -eq 0) {
        Write-Host "⚠️  WARNING: No items found for Website channel!" -ForegroundColor Red
        Write-Host "   This means Rista has NOT configured prices for 'Website' channel." -ForegroundColor Red
        Write-Host "   Orders will be created but menu will be empty." -ForegroundColor Red
        Write-Host ""
        $TEST1_PASSED = $false
    } else {
        Write-Host "✅ TEST 1 PASSED: Website channel has $totalItems items" -ForegroundColor Green
        Write-Host ""
        
        # Show sample items
        Write-Host "📋 Sample Items:" -ForegroundColor Cyan
        foreach ($cat in $menuResponse.categories | Select-Object -First 2) {
            Write-Host "  Category: $($cat.name)" -ForegroundColor Yellow
            foreach ($item in $cat.items | Select-Object -First 3) {
                Write-Host "    - $($item.name) | SKU: $($item.skuCode) | Price: ₹$($item.price)" -ForegroundColor Gray
            }
        }
        Write-Host ""
        $TEST1_PASSED = $true
    }
} catch {
    Write-Host "❌ TEST 1 FAILED: Menu API Error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $TEST1_PASSED = $false
}

Start-Sleep -Seconds 2

# ═══════════════════════════════════════════════════════════════
# TEST 2: Order Creation API - Website Channel
# ═══════════════════════════════════════════════════════════════
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 2: Order Creation API - Website Channel" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

$orderPayload = @{
    id = Get-Random -Minimum 9000000 -Maximum 9999999
    order_number = Get-Random -Minimum 9000 -Maximum 9999
    email = "test-website@mycoffeeco.com"
    created_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    customer = @{
        id = 888888
        first_name = "Test"
        last_name = "Website"
        phone = "+919876543210"
        email = "test-website@mycoffeeco.com"
    }
    billing_address = @{
        phone = "+919876543210"
        first_name = "Test"
        last_name = "Website"
    }
    shipping_address = @{
        phone = "+919876543210"
    }
    line_items = @(
        @{
            id = 888001
            sku = "228"
            name = "Americano - Regular"
            quantity = 1
            price = "104.00"
            title = "Americano"
            variant_title = "Regular"
        }
    )
    note_attributes = @(
        @{ name = "rista_branch"; value = $BRANCH }
        @{ name = "rista_channel"; value = $CHANNEL }
    )
    total_price = "104.00"
    subtotal_price = "104.00"
    total_tax = "0.00"
    gateway = "shopify_payments"
    financial_status = "paid"
} | ConvertTo-Json -Depth 10

$orderUrl = "$MIDDLEWARE_URL/api/orders"
Write-Host "📡 Calling: $orderUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Order Payload:" -ForegroundColor Cyan
Write-Host "  Order ID: $($orderPayload | ConvertFrom-Json | Select-Object -ExpandProperty id)" -ForegroundColor Gray
Write-Host "  Customer: Test Website" -ForegroundColor Gray
Write-Host "  Phone: +919876543210" -ForegroundColor Gray
Write-Host "  Item: Americano - Regular (SKU: 228)" -ForegroundColor Gray
Write-Host "  Total: ₹104.00" -ForegroundColor Gray
Write-Host "  Branch: $BRANCH" -ForegroundColor Gray
Write-Host "  Channel: $CHANNEL" -ForegroundColor Gray
Write-Host ""

try {
    $orderResponse = Invoke-RestMethod -Uri $orderUrl -Method Post -ContentType "application/json" -Body $orderPayload
    
    Write-Host "✅ Order Creation Response:" -ForegroundColor Green
    Write-Host ($orderResponse | ConvertTo-Json -Depth 5)
    Write-Host ""
    
    if ($orderResponse.invoiceNumber) {
        Write-Host "✅ TEST 2 PASSED: Order created successfully" -ForegroundColor Green
        Write-Host "   Invoice: $($orderResponse.invoiceNumber)" -ForegroundColor Green
        Write-Host "   Branch: $($orderResponse.branchName)" -ForegroundColor Green
        Write-Host "   Status: Order should appear in Rista POS now" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Check Rista POS:" -ForegroundColor Yellow
        Write-Host "   - Go to Head Office outlet" -ForegroundColor Gray
        Write-Host "   - Look for Invoice #$($orderResponse.invoiceNumber)" -ForegroundColor Gray
        Write-Host "   - Channel should show: Website" -ForegroundColor Gray
        Write-Host "   - Click 'Accept' to test acceptance" -ForegroundColor Gray
        Write-Host ""
        $TEST2_PASSED = $true
        $INVOICE_NUMBER = $orderResponse.invoiceNumber
    } else {
        Write-Host "⚠️  WARNING: Order created but no invoice number" -ForegroundColor Yellow
        Write-Host ""
        $TEST2_PASSED = $false
    }
} catch {
    Write-Host "❌ TEST 2 FAILED: Order Creation Error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
    $TEST2_PASSED = $false
}

Start-Sleep -Seconds 2

# ═══════════════════════════════════════════════════════════════
# TEST 3: Callback API - Verify webhook endpoint works
# ═══════════════════════════════════════════════════════════════
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 3: Callback API - Webhook Verification" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

if ($TEST2_PASSED -and $INVOICE_NUMBER) {
    $callbackPayload = @{
        id = [guid]::NewGuid().ToString()
        type = "order.status"
        context = @{
            branchName = "Head office"
            branchCode = $BRANCH
        }
        data = @{
            invoiceNumber = $INVOICE_NUMBER
            status = "Accepted"
            channelName = $CHANNEL
            sourceInvoiceNumber = "#TEST"
        }
        createdDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json -Depth 10
} else {
    $callbackPayload = @{
        invoiceNumber = "TEST-001"
        status = "Accepted"
        channelName = $CHANNEL
    } | ConvertTo-Json -Depth 10
}

$callbackUrl = "$MIDDLEWARE_URL/api/orders/callback"
Write-Host "📡 Calling: $callbackUrl" -ForegroundColor Yellow
Write-Host "🔐 Header: x-rista-secret: $CALLBACK_SECRET" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "x-rista-secret" = $CALLBACK_SECRET
        "Content-Type" = "application/json"
    }
    
    $callbackResponse = Invoke-WebRequest -Uri $callbackUrl -Method Post -Headers $headers -Body $callbackPayload
    
    if ($callbackResponse.StatusCode -eq 200) {
        Write-Host "✅ TEST 3 PASSED: Callback endpoint works" -ForegroundColor Green
        Write-Host "   Status Code: 200 OK" -ForegroundColor Green
        Write-Host "   Webhook is configured correctly" -ForegroundColor Green
        Write-Host ""
        $TEST3_PASSED = $true
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($callbackResponse.StatusCode)" -ForegroundColor Yellow
        Write-Host ""
        $TEST3_PASSED = $false
    }
} catch {
    Write-Host "❌ TEST 3 FAILED: Callback API Error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $TEST3_PASSED = $false
}

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$testResults = @(
    @{ Name = "TEST 1: Menu API (Website Channel)"; Passed = $TEST1_PASSED }
    @{ Name = "TEST 2: Order Creation (Website Channel)"; Passed = $TEST2_PASSED }
    @{ Name = "TEST 3: Callback Webhook"; Passed = $TEST3_PASSED }
)

foreach ($test in $testResults) {
    if ($test.Passed) {
        Write-Host "  ✅ $($test.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($test.Name)" -ForegroundColor Red
    }
}

Write-Host ""

$allPassed = ($TEST1_PASSED -and $TEST2_PASSED -and $TEST3_PASSED)

if ($allPassed) {
    Write-Host "🎉 ALL TESTS PASSED! Website channel integration is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to Rista POS Head Office outlet" -ForegroundColor Gray
    Write-Host "  2. Find Invoice #$INVOICE_NUMBER" -ForegroundColor Gray
    Write-Host "  3. Click 'Accept' to verify acceptance works" -ForegroundColor Gray
    Write-Host "  4. Ready for production!" -ForegroundColor Gray
} elseif (-not $TEST1_PASSED) {
    Write-Host "⚠️  WEBSITE CHANNEL NOT CONFIGURED IN RISTA" -ForegroundColor Red
    Write-Host ""
    Write-Host "Issue:" -ForegroundColor Yellow
    Write-Host "  Menu API returned no items for 'Website' channel" -ForegroundColor Gray
    Write-Host "  This means Rista has not configured prices for this channel" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  Ask Rista team to add prices for 'Website' channel" -ForegroundColor Gray
    Write-Host "  They need to configure this in their admin panel" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Email Rista:" -ForegroundColor Yellow
    Write-Host "  Subject: Website Channel Missing Prices" -ForegroundColor Gray
    Write-Host "  Body: Please configure prices for all menu items for 'Website' channel" -ForegroundColor Gray
} elseif (-not $TEST2_PASSED) {
    Write-Host "❌ ORDER CREATION FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check:" -ForegroundColor Yellow
    Write-Host "  - Middleware logs on Render" -ForegroundColor Gray
    Write-Host "  - MOCK_MODE is set to false" -ForegroundColor Gray
    Write-Host "  - Rista API credentials are correct" -ForegroundColor Gray
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Review the errors above and:" -ForegroundColor Gray
    Write-Host "  - Check Render logs" -ForegroundColor Gray
    Write-Host "  - Verify configuration" -ForegroundColor Gray
    Write-Host "  - Contact Rista support if needed" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
