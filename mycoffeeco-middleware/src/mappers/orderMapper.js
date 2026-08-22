/**
 * orderMapper.js
 *
 * Maps a Shopify Order payload
 * into a Rista Sale payload.
 * 
 * Updated to match new Rista API format (2026-08-22)
 */

/**
 * @param {object} shopifyOrder  - The raw Shopify order webhook payload
 * @param {string} ristaCustomerId - Rista customer ID resolved by orderService
 *                                   (Shopify webhooks don't include metafields,
 *                                    so we look it up separately before mapping)
 */
exports.mapShopifyOrderToRista = (shopifyOrder, ristaCustomerId = "") => {

    // ==========================================
    // Validation
    // ==========================================

    if (!shopifyOrder) {
        throw new Error("Shopify order payload is missing.");
    }

    if (!shopifyOrder.customer) {
        throw new Error("Customer information is missing.");
    }

    if (!shopifyOrder.line_items || shopifyOrder.line_items.length === 0) {
        throw new Error("Order contains no line items.");
    }

    const customer = shopifyOrder.customer;
    const shipping = shopifyOrder.shipping_address;

    const hasDelivery = !!shipping;

    // ==========================================
    // Build Payload - New Rista Format
    // ==========================================

    return {

        //----------------------------------------------------
        // Branch — read from Shopify cart attributes if set,
        // otherwise fall back to RISTA_BRANCH_CODE env var
        //----------------------------------------------------

        branchCode: (() => {
            const attrs = shopifyOrder.note_attributes || [];
            const branchAttr = attrs.find(a => a.name === 'rista_branch');
            return branchAttr ? branchAttr.value : (process.env.RISTA_BRANCH_CODE || 'HO');
        })(),

        status: "Open",

        createdDate: shopifyOrder.created_at,

        //----------------------------------------------------
        // Source Information - Updated Format
        //----------------------------------------------------

        sourceInfo: {

            invoiceNumber: shopifyOrder.name,

            orderTransactionId: String(shopifyOrder.id),

            invoiceDate: shopifyOrder.created_at,

            orderTime: shopifyOrder.created_at,

            source: "Online",

            isEditable: false,

            verifyCoupons: false,

            isEcomOrder: true,

            outletId: process.env.RISTA_OUTLET_ID || "shopify_outlet",

            callbackURL: process.env.SHOPIFY_CALLBACK_URL || "",

            callbackHeaders: {}

        },

        //----------------------------------------------------
        // Channel - Updated Format
        //----------------------------------------------------

        channel: (() => {
            const attrs = shopifyOrder.note_attributes || [];
            const channelAttr = attrs.find(a => a.name === 'rista_channel');
            return channelAttr ? channelAttr.value : (process.env.SHOPIFY_RISTA_CHANNEL || 'Website');
        })(),

        //----------------------------------------------------
        // Customer - Simplified Format
        //----------------------------------------------------

        customer: {

            name:
                `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),

            phoneNumber:
                customer.phone ||
                shopifyOrder.shipping_address?.phone ||
                shopifyOrder.billing_address?.phone ||
                ""

        },

        //----------------------------------------------------
        // Items - New Format with Required Tax Structure
        //----------------------------------------------------

        items: shopifyOrder.line_items.map(item => {
            const itemPrice = Number(item.price);
            const itemQty = Number(item.quantity);
            const itemAmount = itemPrice * itemQty;
            
            // Calculate tax amounts (Shopify includes tax in price)
            const taxLines = item.tax_lines || [];
            const totalTaxAmount = taxLines.reduce((sum, tax) => sum + Number(tax.price), 0);
            
            // ALWAYS use CGST/SGST structure (never IGST)
            // Split total tax equally between CGST and SGST
            let taxes;
            if (totalTaxAmount > 0) {
                const totalTaxRate = taxLines.reduce((sum, tax) => sum + Number(tax.rate), 0);
                const halfTaxAmount = totalTaxAmount / 2;
                const halfTaxRate = (totalTaxRate * 100) / 2;
                
                taxes = [
                    {
                        name: "CGST",
                        percentage: halfTaxRate,
                        amountExcluded: halfTaxAmount,
                        amount: halfTaxAmount
                    },
                    {
                        name: "SGST",
                        percentage: halfTaxRate,
                        amountExcluded: halfTaxAmount,
                        amount: halfTaxAmount
                    }
                ];
            } else {
                taxes = [
                    {
                        name: "CGST",
                        percentage: 0.0,
                        amountExcluded: 0.0,
                        amount: 0.0
                    },
                    {
                        name: "SGST",
                        percentage: 0.0,
                        amountExcluded: 0.0,
                        amount: 0.0
                    }
                ];
            }
            
            return {
                skuCode: item.sku || "",
                shortName: item.title,
                longName: item.title,
                itemNature: "Service",
                quantity: itemQty,
                unitPrice: itemPrice,
                itemAmount: itemAmount,
                taxes: taxes,
                taxAmountExcluded: totalTaxAmount,
                itemTotalAmount: itemAmount
            };
        }),

        //----------------------------------------------------
        // Order-level Taxes - ALWAYS use CGST/SGST (never IGST)
        //----------------------------------------------------

        taxes: shopifyOrder.tax_lines && shopifyOrder.tax_lines.length > 0
            ? (() => {
                // Calculate total tax amount and rate
                const totalTaxAmount = shopifyOrder.tax_lines.reduce((sum, tax) => sum + Number(tax.price), 0);
                const totalTaxRate = shopifyOrder.tax_lines.reduce((sum, tax) => sum + Number(tax.rate), 0);
                
                // Split equally between CGST and SGST
                const halfTaxAmount = totalTaxAmount / 2;
                const halfTaxRate = (totalTaxRate * 100) / 2;
                
                return [
                    {
                        name: "CGST",
                        percentage: halfTaxRate,
                        amountExcluded: halfTaxAmount,
                        amount: halfTaxAmount,
                        itemTaxExcluded: halfTaxAmount
                    },
                    {
                        name: "SGST",
                        percentage: halfTaxRate,
                        amountExcluded: halfTaxAmount,
                        amount: halfTaxAmount,
                        itemTaxExcluded: halfTaxAmount
                    }
                ];
            })()
            : [
                {
                    name: "CGST",
                    percentage: 0.0,
                    amountExcluded: 0.0,
                    amount: 0.0,
                    itemTaxExcluded: 0.0
                },
                {
                    name: "SGST",
                    percentage: 0.0,
                    amountExcluded: 0.0,
                    amount: 0.0,
                    itemTaxExcluded: 0.0
                }
            ],

        //----------------------------------------------------
        // Amounts - Updated Structure
        //----------------------------------------------------

        itemTotalAmount: Number(shopifyOrder.subtotal_price || 0),

        totalAmount: Number(shopifyOrder.total_price || 0),

        discountAmount: Number(shopifyOrder.total_discounts || 0),

        billAmount: 0.0, // Will be calculated by Rista

        //----------------------------------------------------
        // Payments - New Format
        //----------------------------------------------------

        payments: [
            {
                mode: (() => {
                    const gw = (shopifyOrder.gateway || "").toLowerCase();
                    if (gw === "cash_on_delivery" || gw === "cod") return "Cash";
                    if (gw === "manual") return "Cash";
                    return "Online";
                })(),
                amount: 0.0 // Rista will calculate based on billAmount
            }
        ],

        //----------------------------------------------------
        // Discounts - New Format (negative amounts)
        //----------------------------------------------------

        discounts: Number(shopifyOrder.total_discounts || 0) > 0
            ? [
                {
                    name: shopifyOrder.discount_applications?.[0]?.title || "Discount",
                    type: "Absolute",
                    rate: Number(shopifyOrder.total_discounts),
                    saleAmount: Number(shopifyOrder.subtotal_price || 0),
                    amount: -Math.abs(Number(shopifyOrder.total_discounts)),
                    reason: shopifyOrder.discount_applications?.[0]?.title || "Shopify Discount"
                }
            ]
            : []

    };

};