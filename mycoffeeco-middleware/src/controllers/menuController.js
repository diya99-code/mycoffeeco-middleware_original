const menuService = require("../services/menuService");

exports.getMenu = async (req, res) => {

    try {

        const { branch, channel } = req.query;

        if (!branch || !channel) {
            return res.status(400).json({
                success: false,
                message: "branch and channel query params are required"
            });
        }

        const menu = await menuService.getMenu(branch, channel);

        // Attach branch to the response
        menu.branch = branch;

        res.json({ success: true, ...menu });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
