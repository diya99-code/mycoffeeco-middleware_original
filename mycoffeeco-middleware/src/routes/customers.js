const express = require("express");

const router = express.Router();

const customerController = require("../controllers/customerController");

// Health check
router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Customer routes are working"
    });
});

// Get customer by phone number
router.get("/:phone", customerController.getCustomer);

// Sync a Shopify customer to Rista
router.post("/sync", customerController.syncCustomer);

module.exports = router;
