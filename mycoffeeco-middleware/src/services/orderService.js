const ristaClient = require("../clients/ristaClient");

const {
    mapShopifyOrderToRista
} = require("../mappers/orderMapper");

/**
 * Create a new sale in Rista from a Shopify order webhook.
 * Called from POST /orders/create
 */
exports.createOrder = async (shopifyOrder) => {

    const payload = mapShopifyOrderToRista(shopifyOrder);

    console.log("Sending to Rista POST /sale");
    console.log("Branch:", payload.branchCode);
    console.log("Channel:", payload.channel);
    console.log("Items count:", payload.items?.length);
    console.log("Total:", payload.totalAmount);

    return await ristaClient.post(
        "/sale",
        payload,
        `sale_${shopifyOrder.id}`
    );

};

/**
 * Fetch a sale from Rista by its invoice number.
 * Called from GET /orders/:saleId
 * Rista uses "invoice" as the query param, not "id".
 */
exports.getOrder = async (saleId) => {

    if (!saleId) throw new Error("saleId is required");

    return await ristaClient.get(`/sale?invoice=${encodeURIComponent(saleId)}`);

};

/**
 * Push a status update for a sale to Rista.
 * Called from POST /orders/status
 * Body: { saleId, status, ... }
 */
exports.updateStatus = async (statusData) => {

    if (!statusData.saleId) throw new Error("saleId is required");

    return await ristaClient.post(
        "/sale/status",
        statusData,
        `status_${statusData.saleId}`
    );

};
