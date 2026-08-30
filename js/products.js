/* Renders product cards for the homepage and shop page. */

function productCardHTML(p){
  const availableSizes = p.sizes.filter(s => s.stock > 0);
  const outOfStock = availableSizes.length === 0;
  return `
    <div class="card reveal">
      <div class="card-media">
        ${p.comparePrice ? `<span class="badge sale">SALE</span>` : (p.featured ? `<span class="badge">NEW</span>` : "")}
        <a href="product.html?id=${p.id}">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
        </a>
        <div class="card-quick">
          <a href="product.html?id=${p.id}" class="btn btn-sm btn-dark">Quick View</a>
        </div>
      </div>
      <div class="card-body">
        <h4>${p.name}</h4>
        <div class="card-price">
          <span class="price">${formatNaira(p.price)}</span>
          ${p.comparePrice ? `<span class="price-old">${formatNaira(p.comparePrice)}</span>` : ""}
        </div>
        <div class="card-sizes">
          ${p.sizes.map(s => `<span class="size-chip" style="${s.stock===0?'opacity:.4;text-decoration:line-through;':''}">${s.size}</span>`).join("")}
        </div>
        <div class="card-cta">
          <button class="btn btn-outline btn-block btn-sm" ${outOfStock ? "disabled" : ""}
            onclick="addToCart('${p.id}', ${availableSizes[0]?.size ?? p.sizes[0].size}, 1)">
            ${outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>`;
}

function renderHomeSections(){
  const newArrivals = document.querySelector("#new-arrivals-grid");
  const bestSellers = document.querySelector("#best-sellers-grid");
  if (newArrivals) newArrivals.innerHTML = PRODUCTS.filter(p => p.featured).slice(0,4).map(productCardHTML).join("");
  if (bestSellers) bestSellers.innerHTML = PRODUCTS.filter(p => p.bestSeller).slice(0,4).map(productCardHTML).join("");
  initScrollReveal();
}

/* ---------------- Shop page ---------------- */
let shopState = { category: null, size: null, maxPrice: null, sort: "newest", query: "" };

function applyShopFilters(){
  let list = [...PRODUCTS];
  if (shopState.query){
    const q = shopState.query.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      String(p.sizes.some(s => String(s.size) === q.replace(/\D/g,"")))
    );
  }
  if (shopState.category) list = list.filter(p => p.category === shopState.category);
  if (shopState.size) list = list.filter(p => p.sizes.some(s => s.size === Number(shopState.size) && s.stock > 0));
  if (shopState.maxPrice) list = list.filter(p => p.price <= Number(shopState.maxPrice));

  switch(shopState.sort){
    case "price-asc": list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "popular": list.sort((a,b) => (b.bestSeller?1:0) - (a.bestSeller?1:0)); break;
    default: break; // newest = original order
  }

  const grid = document.querySelector("#shop-grid");
  const emptyState = document.querySelector("#shop-empty");
  if (!grid) return;
  if (list.length === 0){
    grid.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = list.map(productCardHTML).join("");
  }
  const countEl = document.querySelector("#shop-count");
  if (countEl) countEl.textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;
  initScrollReveal();
}

function initShopPage(){
  const grid = document.querySelector("#shop-grid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  if (params.get("category")) shopState.category = params.get("category");
  if (params.get("q")) shopState.query = params.get("q");

  document.querySelectorAll("[data-filter-category]").forEach(el => {
    el.addEventListener("change", () => {
      shopState.category = el.checked ? el.value : null;
      document.querySelectorAll("[data-filter-category]").forEach(o => { if (o !== el) o.checked = false; });
      applyShopFilters();
    });
    if (el.value === shopState.category) el.checked = true;
  });

  document.querySelectorAll("[data-filter-size]").forEach(el => {
    el.addEventListener("change", () => {
      shopState.size = el.checked ? el.value : null;
      document.querySelectorAll("[data-filter-size]").forEach(o => { if (o !== el) o.checked = false; });
      applyShopFilters();
    });
  });

  const priceRange = document.querySelector("#price-range");
  if (priceRange){
    priceRange.addEventListener("input", () => {
      shopState.maxPrice = priceRange.value;
      document.querySelector("#price-range-label").textContent = formatNaira(priceRange.value);
      applyShopFilters();
    });
  }

  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect){
    sortSelect.addEventListener("change", () => { shopState.sort = sortSelect.value; applyShopFilters(); });
  }

  const searchInput = document.querySelector("#shop-search");
  if (searchInput){
    searchInput.value = shopState.query;
    searchInput.addEventListener("input", () => { shopState.query = searchInput.value; applyShopFilters(); });
  }

  const mobileToggle = document.querySelector(".mobile-filter-toggle");
  if (mobileToggle){
    mobileToggle.addEventListener("click", () => document.querySelector(".filters").classList.toggle("open"));
  }

  applyShopFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeSections();
  initShopPage();
});
