require("dotenv").config();

const express = require("express");

const app = express();

const customerRoutes    = require("./routes/customers");
const loyaltyRoutes     = require("./routes/loyalty");
const orderRoutes       = require("./routes/orders");
const menuRoutes        = require("./routes/menu");
const shopifyRoutes     = require("./routes/shopify");
const authRoutes        = require("./routes/auth");
const directOrderRoutes = require("./routes/directOrder");

// Apply express.json() globally EXCEPT for /orders/create
// which needs the raw body buffer for Shopify HMAC verification
app.use((req, res, next) => {
    if (req.path === "/orders/create" && req.method === "POST") {
        return next(); // skip — express.raw() is applied per-route
    }
    express.json()(req, res, next);
});

// CORS — allow Shopify storefront and any browser to call /api/menu
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});


app.get("/", (_req, res) => {
    res.send("Middleware Running");
});

// Keep-alive endpoint for cron pings to prevent Render free tier spin-down
app.get("/ping", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/customers",    customerRoutes);
app.use("/loyalty",      loyaltyRoutes);
app.use("/orders",       orderRoutes);
app.use("/api/menu",     menuRoutes);
app.use("/shopify",      shopifyRoutes);
app.use("/auth",         authRoutes);
app.use("/direct-order", directOrderRoutes);

// Global error handler — catches any unhandled errors from routes/controllers
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        error: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});