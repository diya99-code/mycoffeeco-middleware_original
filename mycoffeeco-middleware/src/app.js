require("dotenv").config();

const express = require("express");

const app = express();

const customerRoutes = require("./routes/customers");
const loyaltyRoutes = require("./routes/loyalty");
const orderRoutes = require("./routes/orders");
const menuRoutes = require("./routes/menu");

app.use(express.json());


app.get("/", (_req, res) => {
    res.send("Middleware Running");
});

app.use("/customers", customerRoutes);
app.use("/loyalty", loyaltyRoutes);
app.use("/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

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