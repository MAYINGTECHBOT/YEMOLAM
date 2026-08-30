/* Cart stored in localStorage under 'yemolam_cart'.
   In production, when a user is logged in, sync this with a Supabase 'carts' table. */

const CART_KEY = "yemolam_cart";

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, size, quantity){
  const product = getProductById(productId);
  if (!product) return;
  const sizeEntry = product.sizes.find(s => s.size === Number(size));
  if (!sizeEntry || sizeEntry.stock <= 0) { showToast("That size is out of stock."); return; }

  const cart = getCart();
  const existing = cart.find(i => i.productId === productId && i.size === Number(size));
  const desiredQty = (existing ? existing.quantity : 0) + quantity;

  if (desiredQty > sizeEntry.stock){
    showToast(`Only ${sizeEntry.stock} left in size ${size}.`);
    return;
  }

  if (existing){
    existing.quantity = desiredQty;
  } else {
    cart.push({ productId, size: Number(size), quantity, price: product.price, name: product.name, image: product.images[0] });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId, size){
  const cart = getCart().filter(i => !(i.productId === productId && i.size === size));
  saveCart(cart);
  renderCartPage();
}

function updateCartQuantity(productId, size, quantity){
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size);
  if (!item) return;
  const product = getProductById(productId);
  const sizeEntry = product?.sizes.find(s => s.size === size);
  const max = sizeEntry ? sizeEntry.stock : 99;
  item.quantity = Math.max(1, Math.min(quantity, max));
  saveCart(cart);
  renderCartPage();
}

function cartSubtotal(){
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getDeliveryFee(state){
  return CONFIG.deliveryFees[state] ?? CONFIG.deliveryFees.Other;
}

/* ---------- Cart page rendering ---------- */
function renderCartPage(){
  const list = document.querySelector("#cart-list");
  if (!list) return;
  const cart = getCart();

  if (cart.length === 0){
    list.innerHTML = `
      <div class="empty-state">
        <h3>YOUR CART IS EMPTY</h3>
        <p>Looks like you haven't added anything yet.</p>
        <br/>
        <a href="shop.html" class="btn btn-primary">START SHOPPING</a>
      </div>`;
    document.querySelector("#cart-summary").style.display = "none";
    return;
  }

  document.querySelector("#cart-summary").style.display = "block";
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-meta">
        <h4>${item.name}</h4>
        <p>Size ${item.size}</p>
        <div class="qty-control" style="margin-top:8px;">
          <button onclick="updateCartQuantity('${item.productId}', ${item.size}, ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity('${item.productId}', ${item.size}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <strong>${formatNaira(item.price * item.quantity)}</strong>
        <button class="remove-link" onclick="removeFromCart('${item.productId}', ${item.size})">Remove</button>
      </div>
    </div>
  `).join("");

  const subtotal = cartSubtotal();
  const state = localStorage.getItem("yemolam_state") || "Other";
  const delivery = cart.length ? getDeliveryFee(state) : 0;
  document.querySelector("#sum-subtotal").textContent = formatNaira(subtotal);
  document.querySelector("#sum-delivery").textContent = formatNaira(delivery);
  document.querySelector("#sum-total").textContent = formatNaira(subtotal + delivery);
}

document.addEventListener("DOMContentLoaded", renderCartPage);
