const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {

    try {

        const result = await orderService.createOrder(req.body);

        res.json(result);

    } catch (err) {

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