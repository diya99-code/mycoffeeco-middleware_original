const shopifySyncService = require("../services/shopifySyncService");

/**
 * POST /shopify/sync
 * Triggers a full sync of the Rista catalog into Shopify products.
 * Run this once initially, then whenever the catalog changes significantly.
 */
exports.syncProducts = async (req, res) => {
    try {
        console.log("Starting Rista → Shopify product sync...");
        const result = await shopifySyncService.syncCatalogToShopify();
        console.log("Sync complete:", result);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error("Sync failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
