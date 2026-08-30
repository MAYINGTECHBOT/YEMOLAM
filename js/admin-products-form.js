/* Drives the Add/Edit Product modal on admin/products.html */

const STANDARD_SIZES = [39, 40, 41, 42, 43, 44];
let pendingImages = []; // data URLs for the product currently being added/edited

function openProductModal(productId){
  const modal = document.querySelector("#product-modal");
  const form = document.querySelector("#product-form");
  form.reset();
  pendingImages = [];
  document.querySelector("#image-preview-row").innerHTML = "";

  const product = productId ? PRODUCTS.find(p => p.id === productId) : null;
  document.querySelector("#modal-title").textContent = product ? "Edit Product" : "Add Product";
  form.editId.value = product ? product.id : "";

  if (product){
    form.name.value = product.name;
    form.category.value = product.category;
    form.description.value = product.description || "";
    form.price.value = product.price;
    form.comparePrice.value = product.comparePrice || "";
    form.brand.value = product.brand || "Yemolam";
    form.color.value = product.color || "";
    form.featured.checked = !!product.featured;
    form.bestSeller.checked = !!product.bestSeller;
    form.active.checked = product.active !== false;
    pendingImages = [...(product.images || [])];
    renderImagePreviews();
  }

  buildSizeStockGrid(product);
  modal.classList.add("open");
}

function closeProductModal(){
  document.querySelector("#product-modal").classList.remove("open");
}

function buildSizeStockGrid(product){
  const grid = document.querySelector("#size-stock-grid");
  grid.innerHTML = STANDARD_SIZES.map(size => {
    const existing = product?.sizes.find(s => s.size === size);
    return `
      <div class="size-stock-item">
        <span style="font-weight:600; font-size:.85rem;">${size}</span>
        <input type="number" min="0" data-size="${size}" value="${existing ? existing.stock : 0}" placeholder="Stock">
      </div>`;
  }).join("");
}

function renderImagePreviews(){
  const row = document.querySelector("#image-preview-row");
  row.innerHTML = pendingImages.map((src, i) => `
    <div class="img-thumb">
      <img src="${src}">
      <span class="remove-thumb" onclick="removePendingImage(${i})">&times;</span>
    </div>`).join("");
}

function removePendingImage(index){
  pendingImages.splice(index, 1);
  renderImagePreviews();
}

document.addEventListener("change", async (e) => {
  if (e.target.name === "images" && e.target.files.length){
    for (const file of e.target.files){
      const dataUrl = await readFileAsDataURL(file);
      pendingImages.push(dataUrl);
    }
    renderImagePreviews();
    e.target.value = ""; // allow re-selecting the same file later
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "product-form") return;
  e.preventDefault();
  const form = e.target;

  const sizes = Array.from(document.querySelectorAll("#size-stock-grid input")).map(input => ({
    size: Number(input.dataset.size),
    stock: Math.max(0, Number(input.value) || 0)
  }));

  const productData = {
    name: form.name.value.trim(),
    category: form.category.value,
    description: form.description.value.trim(),
    price: Number(form.price.value),
    comparePrice: form.comparePrice.value ? Number(form.comparePrice.value) : null,
    brand: form.brand.value.trim() || "Yemolam",
    color: form.color.value.trim(),
    images: pendingImages.length ? pendingImages : ["https://placehold.co/800x800/201510/e7d3ba?text=" + encodeURIComponent(form.name.value || "Product")],
    sizes,
    featured: form.featured.checked,
    bestSeller: form.bestSeller.checked,
    active: form.active.checked
  };

  if (!productData.name || !productData.price){
    showToast("Please fill in the product name and price.");
    return;
  }

  const editId = form.editId.value;
  if (editId){
    updateProduct(editId, productData);
    showToast(`${productData.name} updated.`);
  } else {
    addProduct(productData);
    showToast(`${productData.name} added.`);
  }

  closeProductModal();
  renderAdminProducts();
  renderAdminInventory();
  renderDashboard();
});
