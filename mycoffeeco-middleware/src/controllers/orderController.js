const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {

    try {
        console.log("createOrder controller hit");
        console.log("Order ID:", req.body?.id);
        console.log("Line items count:", req.body?.line_items?.length);
        console.log("Note attributes:", JSON.stringify(req.body?.note_attributes));

        const result = await orderService.createOrder(req.body);

        console.log("Rista order result:", JSON.stringify(result).slice(0, 200));
        if (result.url) {
            console.log("Rista order URL:", result.url);
        }
        console.log("Rista invoice number:", result.invoiceNumber);
        res.json(result);

    } catch (err) {
        console.error("createOrder error:", err.message);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }

};

exports.getOrder = async (req, res) => {

    try {

        const result = await orderService.getOrder(req.params.saleId);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

exports.updateStatus = async (req, res) => {

    try {

        const result = await orderService.updateStatus(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

/**
 * POST /orders/callback
 * Receives order status update callbacks FROM Rista POS.
 * Rista calls this URL (set as callbackURL in the sale payload) when
 * an order status changes (e.g. Accepted, Prepared, Dispatched, Completed).
 *
 * Rista sends: { invoiceNumber, status, ... }
 * We log it and respond 200 — extend this to notify Shopify if needed.
 */
exports.ristaCallback = async (req, res) => {

    try {

        const body = req.body;

        console.log(`[rista-callback] Status update received:`);
        console.log(`  Invoice : ${body.invoiceNumber || body.invoice || "(unknown)"}`);
        console.log(`  Status  : ${body.status || body.fulfillmentStatus || "(unknown)"}`);
        console.log(`  Raw     : ${JSON.stringify(body).slice(0, 300)}`);

        // Always respond 200 quickly so Rista doesn't retry
        res.sendStatus(200);

    } catch (err) {

        console.error("[rista-callback] Error:", err.message);
        res.sendStatus(200); // still 200 — don't cause Rista to retry

    }

};