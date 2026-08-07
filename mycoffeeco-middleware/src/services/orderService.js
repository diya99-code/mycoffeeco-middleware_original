const ristaClient = require("../clients/ristaClient");

const {
    mapShopifyOrderToRista
} = require("../mappers/orderMapper");

/**
 * Look up a customer in Rista by phone number.
 * Returns the Rista customer ID string, or "" if not found / no phone on order.
 * Never throws — a missing customer should not block the order.
 */
async function resolveRistaCustomerId(shopifyOrder) {
    try {
        const rawPhone = shopifyOrder.customer?.phone || "";
        if (!rawPhone) return "";

        // Rista expects 10-digit local number — strip country code and + prefix
        const cleanPhone = rawPhone.replace(/^\+?91/, "").replace(/\D/g, "").slice(-10);
        if (cleanPhone.length !== 10) return "";

        const customer = await ristaClient.get(
            `/customer?phoneNumber=${encodeURIComponent(cleanPhone)}`
        );

        const ristaId = customer?.id || "";
        console.log(`[orderService] Resolved Rista customer ID: "${ristaId}" for phone ${cleanPhone}`);
        return ristaId;

    } catch (err) {
        // Customer not found in Rista, or lookup failed — do not block the order
        console.warn(`[orderService] Could not resolve Rista customer ID: ${err.message}`);
        return "";
    }
}

/**
 * Create a new sale in Rista from a Shopify order webhook.
 * Called from POST /orders/create
 */
exports.createOrder = async (shopifyOrder) => {

    // Resolve the Rista customer ID by phone before building the payload.
    // This populates customer.id in the sale so Rista can link the order
    // to the customer record and calculate loyalty points automatically.
    const ristaCustomerId = await resolveRistaCustomerId(shopifyOrder);

    const payload = mapShopifyOrderToRista(shopifyOrder, ristaCustomerId);

    console.log("Sending to Rista POST /sale");
    console.log("Branch:", payload.branchCode);
    console.log("Channel:", payload.channel);
    console.log("Items count:", payload.items?.length);
    console.log("Total:", payload.totalAmount);
    console.log("Customer ID in payload:", payload.customer?.id || "(none)");

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
