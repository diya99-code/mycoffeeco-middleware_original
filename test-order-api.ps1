# Test Order Creation API
# Run this in PowerShell

$body = @{
    id = 9999999
    order_number = 9999
    email = "test@mycoffeeco.com"
    created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
    customer = @{
        id = 123456
        first_name = "Test"
        last_name = "Customer"
        phone = "+919876543210"
        email = "test@mycoffeeco.com"
    }
    billing_address = @{
        phone = "+919876543210"
        first_name = "Test"
        last_name = "Customer"
    }
    shipping_address = @{
        phone = "+919876543210"
    }
    line_items = @(
        @{
            id = 111111
            sku = "228"
            name = "Americano - Regular"
            quantity = 1
            price = "104.00"
            title = "Americano"
            variant_title = "Regular"
        }
    )
    note_attributes = @(
        @{ name = "Branch"; value = "HO" }
        @{ name = "Channel"; value = "Takeaway" }
    )
    total_price = "104.00"
    subtotal_price = "104.00"
    total_tax = "0.00"
    gateway = "shopify_payments"
    financial_status = "paid"
} | ConvertTo-Json -Depth 10

Write-Host "Testing Order Creation API..." -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Cyan
Write-Host $body -ForegroundColor Gray

$response = Invoke-RestMethod -Uri "https://mycoffeeco-middleware-original.onrender.com/api/orders" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "`nResponse:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10 | Write-Host
