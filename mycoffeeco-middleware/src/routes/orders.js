const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");
const verifyShopify = require("../middleware/verifyShopify");

// express.raw() captures the raw body buffer needed for HMAC verification
router.post("/create", express.raw({ type: "application/json" }), verifyShopify, orderController.createOrder);

router.get("/:saleId", orderController.getOrder);

router.post("/status", orderController.updateStatus);

module.exports = router;