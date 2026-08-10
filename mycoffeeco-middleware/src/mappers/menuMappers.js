/**
 * buildMenu
 *
 * Transforms the Rista enterprise catalog + sold-out list
 * into a clean menu structure for the website.
 *
 * Rista catalog item types:
 * - "Group"  — a parent item with size/variant children (e.g. Cappuccino)
 *              has variantAttributes: [{ name: "Size", values: [...] }]
 *              children reference it via groupItemId
 * - "Simple" — standalone item OR a variant child of a Group
 *
 * Output: Group items carry a `variants` array of their child items
 * (each with skuCode, label, price, tax, available).
 * Simple items with no groupItemId are rendered as standalone cards.
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

    // Index ALL items by itemId for group → children lookup
    const itemById = {};
    for (const item of (catalog.items || [])) {
        itemById[item.itemId] = item;
    }

    // Separate Group parents from variant children and standalones
    const groupParents  = {};   // itemId → group item
    const childrenByParent = {}; // parentItemId → [child items]
    const standalones   = [];

    for (const item of (catalog.items || [])) {
        if (item.status !== "Active") continue;
        if (item.type === "Group") {
            groupParents[item.itemId] = item;
        } else if (item.groupItemId) {
            if (!childrenByParent[item.groupItemId]) childrenByParent[item.groupItemId] = [];
            childrenByParent[item.groupItemId].push(item);
        } else {
            standalones.push(item);
        }
    }

    // Helper: build a priced item object
    function buildItem(item, overrideName) {
        const priceEntry = (item.prices || []).find(p => p.channel === channel);
        if (!priceEntry) return null;
        const basePrice    = Number(priceEntry.price) || 0;
        const displayPrice = Math.round(basePrice);
        const taxAmount    = Math.round(basePrice * 0.05);
        return {
            itemId:    item.itemId,
            skuCode:   item.skuCode,
            name:      overrideName || item.itemName,
            price:     displayPrice,
            tax:       taxAmount,
            available: !soldOutSkus.has(item.skuCode),
            priceBook: priceEntry.priceBook
        };
    }

    // Process Group parents — attach their variant children as size options
    for (const [parentItemId, parent] of Object.entries(groupParents)) {
        const cat = categoryMap[parent.categoryId];
        if (!cat) continue;

        const children = (childrenByParent[parentItemId] || [])
            .filter(c => c.status === "Active");

        // Build variant size options from children
        const variantOptions = children
            .map(child => {
                // Extract size label from variantAttributes
                // e.g. variantAttributes: [{ name: "Size", value: "Large" }]
                const sizeAttr = (child.variantAttributes || []).find(
                    a => /size/i.test(a.name)
                );
                const label = sizeAttr?.value || child.itemName;
                const built = buildItem(child, label);
                if (!built) return null;
                return { ...built, label };
            })
            .filter(Boolean);

        // Use lowest variant price as the "from" price on the card
        const fromPrice = variantOptions.length
            ? Math.min(...variantOptions.map(v => v.price))
            : 0;
        const fromTax = variantOptions.length
            ? Math.min(...variantOptions.map(v => v.tax))
            : 0;

        // Skip if no variants are available on this channel
        if (variantOptions.length === 0) continue;

        cat.items.push({
            itemId:      parent.itemId,
            groupItemId: null,
            type:        "Group",
            skuCode:     parent.skuCode,
            name:        parent.itemName,
            image:       parent.imageURL || null,
            variants:    variantOptions,   // array of { skuCode, label, price, tax, available }
            price:       fromPrice,        // lowest variant price shown on card
            tax:         fromTax,
            available:   variantOptions.some(v => v.available),
            itemNature:  parent.itemNature || "Goods",
            tags:        parent.itemTagIds || []
        });
    }

    // Process standalone Simple items (no groupItemId)
    for (const item of standalones) {
        const cat = categoryMap[item.categoryId];
        if (!cat) continue;
        const priceEntry = (item.prices || []).find(p => p.channel === channel);
        if (!priceEntry) continue;
        const basePrice    = Number(priceEntry.price) || 0;
        const displayPrice = Math.round(basePrice);
        const taxAmount    = Math.round(basePrice * 0.05);

        cat.items.push({
            itemId:      item.itemId,
            groupItemId: null,
            type:        "Simple",
            skuCode:     item.skuCode,
            name:        item.itemName,
            image:       item.imageURL || null,
            variants:    [],
            price:       displayPrice,
            tax:         taxAmount,
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
