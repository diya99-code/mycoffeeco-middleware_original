const menuService   = require("../services/menuService");
const catalogService = require("../services/catalogService");

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

/**
 * GET /api/menu/debug-images
 * Returns the first 5 catalog items that have any image-like field.
 * Use this to find the exact field name Rista uses for product images.
 */
exports.debugImages = async (req, res) => {

    try {

        const catalog = await catalogService.getCatalog();

        // Find items that have any field containing "image", "photo", "img", "picture", "url"
        const itemsWithImages = (catalog.items || [])
            .filter(item => {
                return Object.keys(item).some(key =>
                    /image|photo|img|picture|url|thumb/i.test(key) &&
                    item[key]
                );
            })
            .slice(0, 5)
            .map(item => {
                // Return full item so we can see all keys
                return item;
            });

        // Also show all unique keys across all items (to spot image field name)
        const allKeys = new Set();
        for (const item of (catalog.items || []).slice(0, 20)) {
            Object.keys(item).forEach(k => allKeys.add(k));
        }

        res.json({
            success: true,
            allItemKeys: [...allKeys].sort(),
            itemsWithImages,
            totalItems: catalog.items?.length || 0
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
