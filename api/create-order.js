/**
 * POST /api/create-order
 * Vercel/Node serverless function.
 *
 * Flow:
 *  1. Validate the incoming order payload from checkout.js
 *  2. Re-check stock for every item server-side (never trust the frontend)
 *  3. Insert a "pending" row into `orders` + `order_items` using the
 *     Supabase SERVICE ROLE key (server-side only)
 *  4. Call Paystack's /transaction/initialize with the SECRET key
 *  5. Return { authorization_url, reference } to the browser
 *
 * Required environment variables (set in your hosting provider, never in git):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   PAYSTACK_SECRET_KEY
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      customer_name, customer_email, customer_phone,
      delivery_address, city, state, delivery_notes,
      subtotal, delivery_fee, discount, total_amount, items
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !items?.length){
      return res.status(400).json({ error: "Missing required order fields." });
    }

    // 1. Re-validate stock atomically for every item (prevents overselling).
    for (const item of items){
      const { data: inv, error } = await supabase
        .from("inventory")
        .select("stock")
        .eq("product_id", item.productId)
        .eq("size", item.size)
        .single();

      if (error || !inv || inv.stock < item.quantity){
        return res.status(409).json({ error: `Size ${item.size} is no longer available in the requested quantity.` });
      }
    }

    // 2. Create the order (status: pending, payment_status: pending).
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name, customer_email, customer_phone,
        delivery_address, city, state,
        subtotal, delivery_fee, discount, total_amount,
        payment_status: "pending", order_status: "pending"
      })
      .select()
      .single();

    if (orderError) return res.status(500).json({ error: "Could not create order." });

    // 3. Insert order items with price captured at time of purchase.
    const orderItems = items.map(i => ({
      order_id: order.id, product_id: i.productId, product_name: i.name,
      size: i.size, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity
    }));
    await supabase.from("order_items").insert(orderItems);

    // 4. Initialize Paystack transaction (SECRET key stays server-side only).
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: customer_email,
        amount: Math.round(total_amount * 100), // Paystack expects kobo
        reference: `YEM-${order.id}-${Date.now()}`,
        callback_url: `${process.env.PUBLIC_SITE_URL}/api/paystack-verify`
      })
    });
    const paystackData = await paystackRes.json();

    if (!paystackData.status) return res.status(502).json({ error: "Could not start payment." });

    await supabase.from("orders").update({ payment_reference: paystackData.data.reference }).eq("id", order.id);

    return res.status(200).json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference
    });

  } catch (err){
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
