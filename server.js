/**
 * YEMOLAM SHOES — server entrypoint
 * -----------------------------------------------------------------
 * Replaces the static-only Caddy deploy with a real Node/Express
 * server so that /api/create-order and /api/paystack-verify
 * actually run, instead of being served as static .js files.
 *
 * Static site (index.html, shop.html, admin/*, css/, js/) is served
 * as-is. The two serverless-style handlers in /api are mounted as
 * real Express routes.
 */

const path = require("path");
const express = require("express");

const createOrder = require("./api/create-order");
const paystackVerify = require("./api/paystack-verify");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// --- API routes -----------------------------------------------------
app.post("/api/create-order", createOrder);
app.get("/api/paystack-verify", paystackVerify);

// --- Static site (must come after API routes) -----------------------
app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

// Fallback 404 for anything else
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Yemolam Shoes server running on port ${PORT}`);
});
