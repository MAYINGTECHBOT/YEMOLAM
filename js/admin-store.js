/**
 * ADMIN PRODUCT STORE
 * -----------------------------------------------------------------
 * This makes "Add Product", "Edit", "Delete", and inventory updates
 * actually work in the browser right now, persisted to localStorage
 * under 'yemolam_products' so changes survive a page refresh.
 *
 * When Supabase is connected, replace the body of each function below
 * with the equivalent query (the shape/signature can stay the same,
 * so admin.js and products.html do not need to change):
 *
 *   addProduct(product)     -> supabase.from('products').insert(...)
 *                               + product_sizes/inventory inserts
 *                               + upload images to Storage bucket
 *   updateProduct(id, data) -> supabase.from('products').update(...).eq('id', id)
 *   deleteProduct(id)       -> supabase.from('products').delete().eq('id', id)
 *   updateStock(id, size, stock) -> supabase.from('inventory').update({stock}).match({product_id:id, size})
 *
 * On load, this file seeds localStorage from the PRODUCTS sample array
 * (products-data.js) the first time it runs, then treats localStorage
 * as the source of truth and overwrites the global PRODUCTS variable.
 */

const PRODUCTS_KEY = "yemolam_products";

function loadProductStore(){
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    if (stored && Array.isArray(stored) && stored.length){
      PRODUCTS = stored;
      return;
    }
  } catch {}
  // First run: seed localStorage from the sample data already in PRODUCTS.
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
}

function persistProductStore(){
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
}

function addProduct(product){
  product.id = product.id || slugify(product.name);
  product.createdAt = new Date().toISOString();
  PRODUCTS.unshift(product);
  persistProductStore();
  return product;
}

function updateProduct(id, updates){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return null;
  Object.assign(p, updates);
  persistProductStore();
  return p;
}

function deleteProduct(id){
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  persistProductStore();
}

function updateStock(productId, size, newStock){
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const s = p.sizes.find(s => s.size === Number(size));
  if (s) s.stock = Math.max(0, Number(newStock) || 0);
  persistProductStore();
}

function readFileAsDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Run immediately (before DOMContentLoaded) so PRODUCTS is correct
// by the time products.js / admin.js render the page.
loadProductStore();
