/**
 * buildMenu
 *
 * Transforms the Rista enterprise catalog + sold-out list
 * into a clean menu structure for the website.
 *
 * Catalog item structure (from /catalog/enterprise):
 * {
 *   itemId, type, skuCode, itemName, status,
 *   categoryId, groupItemId,
 *   variantValues: [{ name, value }],
 *   prices: [{ channel, price, priceBook }],
 *   itemNature, itemTagIds, ...
 * }
 *
 * Output structure:
 * {
 *   categories: [{ categoryId, name, items: [...] }]
 * }
 */
exports.buildMenu = (catalog, soldOut, channel) => {

    // Build a set of sold-out SKU codes for fast lookup
    const soldOutSkus = new Set(
        (soldOut?.data || []).map(item => item.skuCode)
    );

    // Build a category map for fast lookup
    const categoryMap = {};
    for (const cat of (catalog.categories || [])) {
        categoryMap[cat.categoryId] = {
            categoryId: cat.categoryId,
            name: cat.name,
            items: []
        };
    }

    // Process each item
    for (const item of (catalog.items || [])) {

        // Only include Active items
        if (item.status !== "Active") continue;

        // Find the price for the requested channel
        const priceEntry = (item.prices || []).find(
            p => p.channel === channel
        );

        // Skip items not available on this channel
        if (!priceEntry) continue;

        const basePrice = Number(priceEntry.price) || 0;
        const priceWithTax = Math.round(basePrice * 1.05);

        category.items.push({
            itemId:      item.itemId,
            groupItemId: item.groupItemId || null,
            type:        item.type,          // "Single" or "Variant"
            skuCode:     item.skuCode,
            name:        item.itemName,
            image:       item.imageURL || null,
            variants:    item.variantValues || [],
            price:       priceWithTax,
            priceBook:   priceEntry.priceBook,
            available:   !soldOutSkus.has(item.skuCode),
            itemNature:  item.itemNature || "Goods",
            tags:        item.itemTagIds || []
        });
    }

    // Return only categories that have items on this channel
    const categories = Object.values(categoryMap).filter(
        cat => cat.items.length > 0
    );

    return {
        branch:     undefined,  // filled in by controller
        channel,
        categories
    };

};
