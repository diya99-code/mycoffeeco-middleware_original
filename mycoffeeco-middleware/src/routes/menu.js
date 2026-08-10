const express = require("express");

const router = express.Router();

const menuController = require("../controllers/menuController");

router.get("/", menuController.getMenu);

// Debug endpoint — shows raw Rista catalog item fields to identify image field name
router.get("/debug-images", menuController.debugImages);

module.exports = router;
