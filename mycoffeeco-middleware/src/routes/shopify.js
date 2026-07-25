const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/shopifySyncController");

// POST /shopify/sync — sync Rista catalog to Shopify products
router.post("/sync", controller.syncProducts);

module.exports = router;
