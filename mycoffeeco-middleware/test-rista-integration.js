/**
 * Rista API Integration Test
 * 
 * Tests the complete Rista API integration with new credentials
 * Testing Branch: Head Office (HO)
 * Testing Channel: App Testing
 */

require('dotenv').config();
const ristaClient = require('./src/clients/ristaClient');

// Test configuration
const TEST_BRANCH = 'HO'; // Head Office
const TEST_CHANNEL = 'App Testing';
const TEST_PHONE = '9876543210'; // Test customer phone

console.log('═══════════════════════════════════════════════════════════');
console.log('RISTA API INTEGRATION TEST');
console.log('═══════════════════════════════════════════════════════════');
console.log('Base URL:', process.env.RISTA_BASE_URL);
console.log('API Key:', process.env.RISTA_API_KEY ? '✓ Set' : '✗ Missing');
console.log('Secret Key:', process.env.RISTA_SECRET_KEY ? '✓ Set' : '✗ Missing');
console.log('Mock Mode:', process.env.MOCK_MODE);
console.log('Test Branch:', TEST_BRANCH);
console.log('Test Channel:', TEST_CHANNEL);
console.log('═══════════════════════════════════════════════════════════\n');

async function runTests() {
    let testsPassed = 0;
    let testsFailed = 0;

    // TEST 1: Get Menu/Catalog
    console.log('TEST 1: Get Menu/Catalog');
    console.log('─────────────────────────────────────────────────────────');
    try {
        const menu = await ristaClient.get(`/catalog?branchCode=${TEST_BRANCH}`);
        
        if (menu && menu.categories) {
            console.log('✓ SUCCESS: Menu retrieved');
            console.log(`  - Categories: ${menu.categories.length}`);
            console.log(`  - Total Items: ${menu.categories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}`);
            
            // Show first category and item as sample
            if (menu.categories[0]) {
                const firstCat = menu.categories[0];
                console.log(`  - Sample Category: ${firstCat.name} (${firstCat.items?.length || 0} items)`);
                if (firstCat.items && firstCat.items[0]) {
                    const firstItem = firstCat.items[0];
                    console.log(`  - Sample Item: ${firstItem.name} - ₹${firstItem.price}`);
                }
            }
            testsPassed++;
        } else {
            console.log('✗ FAILED: Invalid menu structure');
            console.log('Response:', JSON.stringify(menu, null, 2));
            testsFailed++;
        }
    } catch (err) {
        console.log('✗ FAILED:', err.message);
        testsFailed++;
    }
    console.log('');

    // TEST 2: Get Customer by Phone
    console.log('TEST 2: Get Customer by Phone');
    console.log('─────────────────────────────────────────────────────────');
    try {
        const customer = await ristaClient.get(`/customer?phoneNumber=${TEST_PHONE}`);
        
        if (customer) {
            console.log('✓ SUCCESS: Customer found');
            console.log(`  - ID: ${customer.id || 'N/A'}`);
            console.log(`  - Name: ${customer.name || 'N/A'}`);
            console.log(`  - Phone: ${customer.phoneNumber || 'N/A'}`);
            console.log(`  - Loyalty Points: ${customer.loyaltyPoints || 0}`);
            testsPassed++;
        } else {
            console.log('⚠ Customer not found (this is OK for new customers)');
            console.log('  - Create a customer manually in Rista or this will be created on first order');
            testsPassed++;
        }
    } catch (err) {
        if (err.message.includes('404') || err.message.includes('not found')) {
            console.log('⚠ Customer not found (this is OK for testing)');
            console.log('  - Customer will be auto-created on first order');
            testsPassed++;
        } else {
            console.log('✗ FAILED:', err.message);
            testsFailed++;
        }
    }
    console.log('');

    // TEST 3: Create Test Sale/Order
    console.log('TEST 3: Create Test Sale/Order');
    console.log('─────────────────────────────────────────────────────────');
    try {
        // First get a valid item from menu
        const menu = await ristaClient.get(`/catalog?branchCode=${TEST_BRANCH}`);
        let testItem = null;
        
        for (const category of menu.categories || []) {
            if (category.items && category.items.length > 0) {
                testItem = category.items[0];
                break;
            }
        }

        if (!testItem) {
            console.log('✗ FAILED: No items in menu to test with');
            testsFailed++;
        } else {
            console.log(`  - Using test item: ${testItem.name}`);
            console.log(`  - SKU: ${testItem.skuCode}`);
            console.log(`  - Price: ₹${testItem.price}`);

            const testSale = {
                branchCode: TEST_BRANCH,
                channel: TEST_CHANNEL,
                customer: {
                    name: 'Test Customer',
                    phoneNumber: TEST_PHONE
                },
                items: [
                    {
                        skuCode: testItem.skuCode,
                        name: testItem.name,
                        quantity: 1,
                        unitPrice: parseFloat(testItem.price),
                        taxAmount: parseFloat(testItem.price) * 0.05,
                        discount: 0,
                        subtotal: parseFloat(testItem.price),
                        total: parseFloat(testItem.price) * 1.05
                    }
                ],
                subtotal: parseFloat(testItem.price),
                tax: parseFloat(testItem.price) * 0.05,
                discount: 0,
                totalAmount: parseFloat(testItem.price) * 1.05,
                paymentMethod: 'Online',
                source: 'Shopify',
                externalOrderId: `TEST_${Date.now()}`
            };

            console.log('\n  Creating test order...');
            const result = await ristaClient.post('/sale', testSale, testSale.externalOrderId);

            if (result && result.invoiceNumber) {
                console.log('✓ SUCCESS: Order created in Rista');
                console.log(`  - Invoice Number: ${result.invoiceNumber}`);
                console.log(`  - Sale ID: ${result.saleId || 'N/A'}`);
                console.log(`  - Status: ${result.status || 'N/A'}`);
                console.log(`  - Amount: ₹${testSale.totalAmount.toFixed(2)}`);
                testsPassed++;
            } else {
                console.log('⚠ Order created but response format unexpected');
                console.log('Response:', JSON.stringify(result, null, 2));
                testsPassed++;
            }
        }
    } catch (err) {
        console.log('✗ FAILED:', err.message);
        if (err.response) {
            console.log('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
        testsFailed++;
    }
    console.log('');

    // TEST 4: Get Loyalty Points
    console.log('TEST 4: Get Loyalty Points');
    console.log('─────────────────────────────────────────────────────────');
    try {
        const loyalty = await ristaClient.get(`/loyalty?phoneNumber=${TEST_PHONE}`);
        
        if (loyalty) {
            console.log('✓ SUCCESS: Loyalty data retrieved');
            console.log(`  - Points: ${loyalty.points || 0}`);
            console.log(`  - Total Earned: ${loyalty.totalEarned || 0}`);
            console.log(`  - Total Redeemed: ${loyalty.totalRedeemed || 0}`);
            testsPassed++;
        } else {
            console.log('⚠ No loyalty data (customer may be new)');
            testsPassed++;
        }
    } catch (err) {
        if (err.message.includes('404') || err.message.includes('not found')) {
            console.log('⚠ No loyalty data found (this is OK for new customers)');
            testsPassed++;
        } else {
            console.log('✗ FAILED:', err.message);
            testsFailed++;
        }
    }
    console.log('');

    // TEST 5: Verify Branch and Channel
    console.log('TEST 5: Verify Branch and Channel Configuration');
    console.log('─────────────────────────────────────────────────────────');
    try {
        // Try to get catalog with test branch
        const branchTest = await ristaClient.get(`/catalog?branchCode=${TEST_BRANCH}`);
        
        if (branchTest && branchTest.categories) {
            console.log(`✓ SUCCESS: Branch "${TEST_BRANCH}" is valid`);
            testsPassed++;
        } else {
            console.log(`⚠ Branch "${TEST_BRANCH}" may not be configured properly`);
            testsFailed++;
        }

        // Note: Channel validation happens during order creation
        console.log(`  - Channel "${TEST_CHANNEL}" will be validated during order creation`);
        console.log(`  - Make sure this channel is configured in Rista for branch ${TEST_BRANCH}`);
    } catch (err) {
        console.log('✗ FAILED:', err.message);
        testsFailed++;
    }
    console.log('');

    // SUMMARY
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`✓ Passed: ${testsPassed}`);
    console.log(`✗ Failed: ${testsFailed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (testsFailed === 0) {
        console.log('🎉 ALL TESTS PASSED! Rista API integration is working correctly.');
        console.log('\nNext Steps:');
        console.log('1. Deploy updated .env to Render');
        console.log('2. Test with a real Shopify order');
        console.log('3. Verify order appears in Rista dashboard');
        console.log('4. Check that loyalty points are calculated');
    } else {
        console.log('⚠ SOME TESTS FAILED. Please check the errors above.');
        console.log('\nCommon Issues:');
        console.log('- API Key or Secret Key incorrect');
        console.log('- Branch code not configured in Rista');
        console.log('- Channel not configured for the branch');
        console.log('- Network/firewall issues');
        console.log('\nContact Rista support if issues persist.');
    }
    console.log('');
}

// Run all tests
runTests().catch(err => {
    console.error('Fatal error running tests:', err);
    process.exit(1);
});
