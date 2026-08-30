/**
 * CHECKOUT + PAYSTACK
 * -----------------------------------------------------------------
 * This file drives the checkout form and kicks off the Paystack payment.
 * It NEVER talks to Paystack's secret key — it only:
 *   1. Sends the order details to YOUR backend (/api/create-order)
 *   2. Your backend creates a "pending" order in Supabase and calls
 *      Paystack's /transaction/initialize endpoint with the SECRET key
 *      (server-side only — see /api/paystack-initialize.js)
 *   3. Backend returns an `authorization_url` / `access_code`
 *   4. This script redirects the customer to Paystack to pay
 *   5. Paystack redirects back to /api/paystack-verify -> success.html
 *
 * PAYSTACK_PUBLIC_KEY below is safe to expose in the browser.
 * PAYSTACK_SECRET_KEY must NEVER appear in this file or any frontend code.
 */

const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY";

function renderCheckoutSummary(){
  const cart = getCart();
  const container = document.querySelector("#checkout-items");
  if (!container) return;

  if (cart.length === 0){
    location.href = "shop.html";
    return;
  }

  container.innerHTML = cart.map(i => `
    <div class="summary-row">
      <span>${i.name} × ${i.quantity} <small style="color:#8a7d70">(Size ${i.size})</small></span>
      <span>${formatNaira(i.price * i.quantity)}</span>
    </div>`).join("");

  updateCheckoutTotals();
}

function updateCheckoutTotals(){
  const subtotal = cartSubtotal();
  const state = document.querySelector("#state")?.value || "Other";
  const delivery = getDeliveryFee(state);
  document.querySelector("#co-subtotal").textContent = formatNaira(subtotal);
  document.querySelector("#co-delivery").textContent = formatNaira(delivery);
  document.querySelector("#co-total").textContent = formatNaira(subtotal + delivery);
}

function validateCheckoutForm(form){
  let valid = true;
  ["fullName","phone","email","state","city","address"].forEach(field => {
    const input = form.querySelector(`[name="${field}"]`);
    const error = form.querySelector(`[data-error="${field}"]`);
    if (!input.value.trim()){
      valid = false;
      if (error) error.style.display = "block";
      input.style.borderColor = "var(--danger)";
    } else {
      if (error) error.style.display = "none";
      input.style.borderColor = "";
    }
  });
  return valid;
}

async function handleCheckoutSubmit(e){
  e.preventDefault();
  const form = e.target;
  if (!validateCheckoutForm(form)) { showToast("Please fill in all required fields."); return; }

  const payBtn = form.querySelector("[type=submit]");
  payBtn.disabled = true;
  payBtn.textContent = "Processing...";

  const cart = getCart();
  const subtotal = cartSubtotal();
  const state = form.state.value;
  const delivery = getDeliveryFee(state);
  const total = subtotal + delivery;

  const orderPayload = {
    customer_name: form.fullName.value,
    customer_email: form.email.value,
    customer_phone: form.phone.value,
    delivery_address: form.address.value,
    city: form.city.value,
    state: state,
    delivery_notes: form.notes.value,
    subtotal, delivery_fee: delivery, discount: 0, total_amount: total,
    items: cart
  };

  try {
    // -----------------------------------------------------------------
    // PRODUCTION: replace this block with a real fetch to your backend:
    //
    // const res = await fetch("/api/create-order", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(orderPayload)
    // });
    // const { authorization_url, reference } = await res.json();
    // localStorage.setItem("yemolam_last_order", reference);
    // window.location.href = authorization_url;   // send customer to Paystack
    // -----------------------------------------------------------------

    // DEMO MODE (no backend connected yet): simulate success so the flow
    // can be reviewed end-to-end. Remove this block once /api is live.
    console.warn("[Yemolam] Demo mode: no backend connected. Simulating payment.");
    const fakeRef = "DEMO-" + Date.now();
    localStorage.setItem("yemolam_last_order", JSON.stringify({ ...orderPayload, reference: fakeRef }));
    localStorage.removeItem(CART_KEY);
    setTimeout(() => { window.location.href = "success.html?ref=" + fakeRef; }, 900);

  } catch (err){
    console.error(err);
    showToast("Payment could not be started. Please try again.");
    payBtn.disabled = false;
    payBtn.textContent = "PAY NOW";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  const stateSelect = document.querySelector("#state");
  if (stateSelect) stateSelect.addEventListener("change", updateCheckoutTotals);
  const form = document.querySelector("#checkout-form");
  if (form) form.addEventListener("submit", handleCheckoutSubmit);
});
