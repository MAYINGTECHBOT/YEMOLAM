let currentProduct = null;
let selectedSize = null;
let qty = 1;

function renderProductPage(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  currentProduct = getProductById(id) || PRODUCTS[0];
  const p = currentProduct;

  document.title = `${p.name} — Yemolam Shoes`;
  document.querySelector("#p-name").textContent = p.name;
  document.querySelector("#p-category").textContent = p.category;
  document.querySelector("#p-price").textContent = formatNaira(p.price);
  document.querySelector("#p-old-price").textContent = p.comparePrice ? formatNaira(p.comparePrice) : "";
  document.querySelector("#p-desc").textContent = p.description;
  document.querySelector("#p-color").textContent = p.color;
  document.querySelector("#breadcrumb-name").textContent = p.name;

  document.querySelector("#gallery-main-img").src = p.images[0];
  document.querySelector("#thumb-row").innerHTML = p.images.map((img, i) =>
    `<img src="${img}" class="${i===0?'active':''}" onclick="switchGalleryImage(this,'${img}')">`).join("");

  const sizeGrid = document.querySelector("#size-grid");
  sizeGrid.innerHTML = p.sizes.map(s => `
    <div class="size-box ${s.stock===0?'disabled':''}" data-size="${s.size}" onclick="selectSize(${s.size}, ${s.stock})">
      ${s.size}
    </div>`).join("");

  updateStockNote();
  document.querySelector("#qty-display").textContent = qty;
  renderRelatedProducts(p);
  initScrollReveal();
}

function switchGalleryImage(el, src){
  document.querySelector("#gallery-main-img").src = src;
  document.querySelectorAll("#thumb-row img").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
}

function selectSize(size, stock){
  if (stock === 0) return;
  selectedSize = size;
  document.querySelectorAll(".size-box").forEach(b => b.classList.toggle("selected", Number(b.dataset.size) === size));
  qty = 1;
  document.querySelector("#qty-display").textContent = qty;
  updateStockNote();
}

function updateStockNote(){
  const note = document.querySelector("#stock-note");
  if (!selectedSize){
    note.textContent = "Select a size to see availability.";
    note.className = "stock-note";
    return;
  }
  const entry = currentProduct.sizes.find(s => s.size === selectedSize);
  if (!entry || entry.stock === 0){
    note.textContent = `${selectedSize} — OUT OF STOCK`;
    note.className = "stock-note out";
  } else if (entry.stock <= 3){
    note.textContent = `Only ${entry.stock} left in size ${selectedSize}`;
    note.className = "stock-note low";
  } else {
    note.textContent = `In stock — size ${selectedSize}`;
    note.className = "stock-note in";
  }
}

function changeQty(delta){
  if (!selectedSize){ showToast("Please select a size first."); return; }
  const entry = currentProduct.sizes.find(s => s.size === selectedSize);
  qty = Math.max(1, Math.min(qty + delta, entry.stock || 1));
  document.querySelector("#qty-display").textContent = qty;
}

function handleAddToCart(){
  if (!selectedSize){ showToast("Please select a size first."); return; }
  addToCart(currentProduct.id, selectedSize, qty);
}

function handleBuyNow(){
  if (!selectedSize){ showToast("Please select a size first."); return; }
  addToCart(currentProduct.id, selectedSize, qty);
  location.href = "cart.html";
}

function renderRelatedProducts(p){
  const grid = document.querySelector("#related-grid");
  if (!grid) return;
  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0,4);
  grid.innerHTML = (related.length ? related : PRODUCTS.filter(x=>x.id!==p.id).slice(0,4)).map(productCardHTML).join("");
}

document.addEventListener("DOMContentLoaded", renderProductPage);
