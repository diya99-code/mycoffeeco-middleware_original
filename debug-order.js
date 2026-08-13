/**
 * Debug script to test order creation with current .env settings
 * Run with: node debug-order.js
 */

require('dotenv').config();
const orderService = require('./mycoffeeco-middleware/src/services/orderService');

// Sample Shopify order payload
const sampleOrder = {
    id: 9999999,
    order_number: 9999,
    email: "debug@test.com",
    created_at: new Date().toISOString(),
    customer: {
        id: 123456,
        first_name: "Debug",
        last_name: "Test",
        phone: "+919876543210",
        email: "debug@test.com"
    },
    billing_address: {
        phone: "+919876543210",
        first_name: "Debug",
        last_name: "Test"
    },
    shipping_address: {
        phone: "+919876543210"
    },
    line_items: [
        {
            id: 111111,
            sku: "228",
            name: "Americano - Regular",
            quantity: 1,
            price: "104.00",
            title: "Americano",
            variant_title: "Regular"
        }
    ],
    note_attributes: [
        { name: "Branch", value: "HO" },
        { name: "Channel", value: "Takeaway" }
    ],
    total_price: "104.00",
    subtotal_price: "104.00",
    total_tax: "0.00",
    gateway: "shopify_payments",
    financial_status: "paid"
};

console.log('═══════════════════════════════════════════');
console.log('🔍 DEBUG ORDER CREATION');
console.log('═══════════════════════════════════════════\n');

console.log('📋 Environment Settings:');
console.log('  MOCK_MODE:', process.env.MOCK_MODE);
console.log('  RISTA_BASE_URL:', process.env.RISTA_BASE_URL);
console.log('  RISTA_API_KEY:', process.env.RISTA_API_KEY ? '***' + process.env.RISTA_API_KEY.slice(-8) : 'NOT SET');
console.log('  RISTA_BRANCH_CODE:', process.env.RISTA_BRANCH_CODE);
console.log('  SHOPIFY_RISTA_CHANNEL:', process.env.SHOPIFY_RISTA_CHANNEL);
console.log('');

console.log('📦 Sample Order:');
console.log('  Order ID:', sampleOrder.id);
console.log('  Customer:', sampleOrder.customer.first_name, sampleOrder.customer.last_name);
console.log('  Phone:', sampleOrder.customer.phone);
console.log('  Items:', sampleOrder.line_items.length);
console.log('  Total:', sampleOrder.total_price);
console.log('  Branch:', sampleOrder.note_attributes.find(a => a.name === 'Branch')?.value);
console.log('  Channel:', sampleOrder.note_attributes.find(a => a.name === 'Channel')?.value);
console.log('');

console.log('🚀 Attempting to create order...\n');

orderService.createOrder(sampleOrder)
    .then(result => {
        console.log('✅ SUCCESS!');
        console.log('');
        console.log('📥 Response from Rista:');
        console.log(JSON.stringify(result, null, 2));
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('✅ Order should appear in Rista POS now!');
        console.log('   Branch: Head Office (HO)');
        console.log('   Channel: Takeaway');
        console.log('   Invoice:', result.invoiceNumber);
        console.log('═══════════════════════════════════════════');
    })
    .catch(err => {
        console.error('❌ ERROR!');
        console.error('');
        console.error('Error message:', err.message);
        console.error('');
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', JSON.stringify(err.response.data, null, 2));
        }
        console.error('');
        console.error('Full error:', err);
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('❌ Order NOT created in Rista POS');
        console.log('═══════════════════════════════════════════');
    });
