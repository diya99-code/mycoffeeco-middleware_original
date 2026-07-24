/**
 * orderMapper.js
 *
 * Maps a Shopify Order payload
 * into a Rista Sale payload.
 */

exports.mapShopifyOrderToRista = (shopifyOrder) => {

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
    // Build Payload
    // ==========================================

    return {

        //----------------------------------------------------
        // Branch
        //----------------------------------------------------

        branchCode: process.env.RISTA_BRANCH_CODE,

        status: "Open",

        //----------------------------------------------------
        // Source Information
        //----------------------------------------------------

        sourceInfo: {

            companyName: process.env.COMPANY_NAME,

            source: "Shopify",

            invoiceNumber: shopifyOrder.name,

            orderTransactionId: String(shopifyOrder.id),

            invoiceDate:
                shopifyOrder.created_at,

            callbackURL:
                process.env.SHOPIFY_CALLBACK_URL || "",

            isEditable: true,

            verifyCoupons: true,

            isEcomOrder: true

        },

        //----------------------------------------------------
        // Delivery
        //----------------------------------------------------

        delivery: {

            mode: hasDelivery
                ? "Delivery"
                : "Pickup",

            advanceOrder: false,

            name:
                `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),

            email:
                customer.email || "",

            phoneNumber:
                customer.phone || "",

            deliveryDate:
                shopifyOrder.processed_at ||
                shopifyOrder.created_at,

            address: hasDelivery
                ? {

                    label: "Shipping",

                    addressLine:
                        shipping.address1 || "",

                    city:
                        shipping.city || "",

                    state:
                        shipping.province || "",

                    country:
                        shipping.country || "",

                    zip:
                        shipping.zip || "",

                    landmark: ""

                }
                : undefined

        },

        //----------------------------------------------------
        // Customer
        //----------------------------------------------------

        customer: {

            id:
                customer.metafields?.ristaCustomerId || "",

            name:
                `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),

            email:
                customer.email || "",

            phoneNumber:
                customer.phone || ""

        },

        //----------------------------------------------------
        // Channel
        //----------------------------------------------------

        channel: "Shopify",

        //----------------------------------------------------
        // Products
        //----------------------------------------------------

        items: shopifyOrder.line_items.map(item => ({

            skuCode:
                item.sku || "",

            shortName:
                item.title,

            longName:
                item.title,

            variants:
                item.variant_title || "",

            quantity:
                Number(item.quantity),

            unitPrice:
                Number(item.price),

            itemNature: "Goods",

            itemAmount:
                Number(item.price) *
                Number(item.quantity),

            itemTotalAmount:
                Number(item.price) *
                Number(item.quantity),

            note:
                item.note || "",

            //------------------------------------------------
            // Shopify Customizations
            //------------------------------------------------

            options:

                item.properties

                    ? item.properties

                        .filter(property => property.value)

                        .map(property => ({

                            name:
                                property.name,

                            quantity: 1,

                            unitPrice: 0

                        }))

                    : [],

            //------------------------------------------------
            // Item Discounts
            // Rista spec: discount amount must be negative for a Sale
            //------------------------------------------------

            discounts:

                item.discount_allocations && item.discount_allocations.length > 0

                    ? item.discount_allocations.map(discount => ({

                        name: "Shopify Discount",

                        type: "Absolute",

                        rate: Number(discount.amount),

                        amount: -Math.abs(Number(discount.amount))

                    }))

                    : []

        })),

        //----------------------------------------------------
        // Amounts
        //----------------------------------------------------

        itemTotalAmount:
            Number(shopifyOrder.subtotal_price || 0),

        discountAmount:
            Number(shopifyOrder.total_discounts || 0),

        taxAmountIncluded:
            Number(shopifyOrder.total_tax || 0),

        billAmount:
            Number(shopifyOrder.total_price || 0),

        billRoundedAmount:
            Number(shopifyOrder.total_price || 0),

        totalAmount:
            Number(shopifyOrder.total_price || 0),

        tipAmount:
            Number(shopifyOrder.total_tip_received || 0),

        //----------------------------------------------------
        // Shipping Charges
        // Rista spec: SaleCharge requires name*, type*, rate*, amount*
        //----------------------------------------------------

        charges:

            shopifyOrder.shipping_lines && shopifyOrder.shipping_lines.length > 0

                ? shopifyOrder.shipping_lines.map(charge => ({

                    name:
                        charge.title,

                    type: "Absolute",

                    rate: Number(charge.price),

                    amount:
                        Number(charge.price)

                }))

                : [],

        //----------------------------------------------------
        // Order-level Discounts
        // Rista spec: amount must be negative for a Sale.
        // Shopify gives total_discounts as one number, not per-application,
        // so we emit a single consolidated discount entry.
        //----------------------------------------------------

        discounts:

            Number(shopifyOrder.total_discounts || 0) > 0

                ? [
                    {
                        name:
                            shopifyOrder.discount_applications?.[0]?.title ||
                            "Shopify Discount",

                        type: "Absolute",

                        rate: Number(shopifyOrder.total_discounts),

                        amount: -Math.abs(Number(shopifyOrder.total_discounts))
                    }
                ]

                : [],

        //----------------------------------------------------
        // Taxes
        // Rista spec SaleTax: requires amountIncluded or amountExcluded (not "amount")
        // Shopify tax_lines include tax in price, so we use amountIncluded
        //----------------------------------------------------

        taxes:

            shopifyOrder.tax_lines && shopifyOrder.tax_lines.length > 0

                ? shopifyOrder.tax_lines.map(tax => ({

                    name:
                        tax.title,

                    percentage:
                        Number(tax.rate) * 100,

                    amountIncluded:
                        Number(tax.price)

                }))

                : [],

        //----------------------------------------------------
        // Payments
        //----------------------------------------------------

        payments: [

            {

                mode:
                    shopifyOrder.gateway ||

                    "Online",

                amount:
                    Number(shopifyOrder.total_price),

                reference:
                    String(shopifyOrder.id),

                postedDate:
                    shopifyOrder.processed_at ||
                    shopifyOrder.created_at

            }

        ],

        //----------------------------------------------------
        // Notes
        //----------------------------------------------------

        note:
            shopifyOrder.note || "",

        //----------------------------------------------------
        // Tags
        //----------------------------------------------------

        tags:
            shopifyOrder.tags
                ? shopifyOrder.tags.split(",").map(tag => tag.trim())
                : []

    };

};