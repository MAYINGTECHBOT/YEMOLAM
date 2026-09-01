/**
 * GET /api/paystack-verify?reference=xxx
 * Called when Paystack redirects the customer back after payment.
 *
 * VERY IMPORTANT: this is the ONLY place payment is confirmed.
 * The frontend must never mark an order as paid on its own.
 *
 * Steps:
 *  1. Call Paystack's GET /transaction/verify/:reference with the SECRET key
 *  2. If status === "success", atomically decrement inventory stock
 *     (use a Postgres function / transaction so concurrent buyers can
 *     never both take the last pair — see supabase/schema.sql `decrement_stock`)
 *  3. Mark the order as paid, send confirmation emails
 *  4. Redirect the customer to /success.html?ref=...
 *
 * Required environment variables:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYSTACK_SECRET_KEY, EMAIL_API_KEY
 */

const { createClient } = require("@supabase/supabase-js");

// Mirror of CHECKOUT_ENABLED in js/checkout.js. Flip to true once
// Paystack + Supabase keys are set in Railway and you're ready to
// accept real orders.
const CHECKOUT_ENABLED_ON_BACKEND = false;

let supabase = null;
function getSupabase() {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabase;
}

module.exports = async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.redirect("/success.html?error=missing_reference");

  if (!CHECKOUT_ENABLED_ON_BACKEND) {
    return res.redirect("/checkout.html?error=payments_coming_soon");
  }

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success"){
      await getSupabase().from("orders").update({ payment_status: "failed" }).eq("payment_reference", reference);
      return res.redirect("/checkout.html?error=payment_failed");
    }

    const { data: order } = await getSupabase()
      .from("orders")
      .select("*, order_items(*)")
      .eq("payment_reference", reference)
      .single();

    if (!order) return res.redirect("/success.html?error=order_not_found");

    // Atomically reduce stock per item — never allow it to go negative.
    for (const item of order.order_items){
      await getSupabase().rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_size: item.size,
        p_quantity: item.quantity
      });
    }

    await getSupabase().from("orders").update({ payment_status: "paid", order_status: "processing" }).eq("id", order.id);

    // TODO: send confirmation emails to customer + admin (see EMAIL_API_KEY in .env)

    return res.redirect(`/success.html?ref=${reference}`);

  } catch (err){
    console.error(err);
    return res.redirect("/checkout.html?error=verification_failed");
  }
};
