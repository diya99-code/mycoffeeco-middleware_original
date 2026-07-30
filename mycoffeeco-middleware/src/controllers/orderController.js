const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {

    try {
        console.log("createOrder controller hit");
        console.log("Order ID:", req.body?.id);
        console.log("Line items count:", req.body?.line_items?.length);

        const result = await orderService.createOrder(req.body);

        console.log("Rista order result:", JSON.stringify(result).slice(0, 200));
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