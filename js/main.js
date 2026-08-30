/* Shared site behaviour: nav toggle, cart badge, WhatsApp link, scroll reveal, toast */

const CONFIG = {
  brandName: "Yemolam Shoes",
  whatsappNumber: "2348169321538", // admin-configurable — digits only, country code first
  whatsappDefaultMessage: "Hello, I need help with an order.",
  deliveryFees: { Lagos: 3000, Abuja: 5000, Other: 7000 } // mirrors admin-configurable settings
};

// Apply any saved changes from Admin → Settings so they take effect site-wide.
(function applySavedSettings(){
  try {
    const s = JSON.parse(localStorage.getItem("yemolam_settings"));
    if (!s) return;
    if (s.whatsappNumber) CONFIG.whatsappNumber = s.whatsappNumber;
    if (s.deliveryFees) CONFIG.deliveryFees = s.deliveryFees;
  } catch {}
})();

function initNav(){
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (hamburger && mobileMenu){
    hamburger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
  }
}

function initWhatsApp(){
  document.querySelectorAll("[data-whatsapp]").forEach(el => {
    const msg = encodeURIComponent(CONFIG.whatsappDefaultMessage);
    el.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  });
}

function updateCartBadge(){
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function showToast(message){
  let toast = document.querySelector(".toast");
  if (!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2400);
}

function initScrollReveal(){
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.12 });
  items.forEach(i => io.observe(i));
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initWhatsApp();
  updateCartBadge();
  initScrollReveal();

  const nlForm = document.querySelector(".nl-form");
  if (nlForm){
    nlForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thanks for subscribing! Watch your inbox for new arrivals.");
      nlForm.reset();
    });
  }
});
