/* Admin dashboard rendering — driven by SAMPLE_ORDERS / SAMPLE_CUSTOMERS / PRODUCTS
   until Supabase queries are wired in (see js/admin-data.js). */

function renderDashboard(){
  const body = document.querySelector("#recent-orders-body");
  if (!body) return;

  const totalSales = SAMPLE_ORDERS.filter(o => o.payment === "paid").reduce((s,o)=>s+o.amount,0);
  const todaySales = SAMPLE_ORDERS.filter(o => o.date === "2026-08-27" && o.payment === "paid").reduce((s,o)=>s+o.amount,0);
  const pending = SAMPLE_ORDERS.filter(o => o.status === "pending").length;
  const lowStock = PRODUCTS.reduce((count,p) => count + p.sizes.filter(s => s.stock > 0 && s.stock <= 3).length, 0);

  document.querySelector("#stat-total-sales").textContent = formatNaira(totalSales);
  document.querySelector("#stat-today-sales").textContent = formatNaira(todaySales);
  document.querySelector("#stat-orders").textContent = SAMPLE_ORDERS.length;
  document.querySelector("#stat-pending").textContent = pending;
  document.querySelector("#stat-products").textContent = PRODUCTS.length;
  document.querySelector("#stat-lowstock").textContent = lowStock;

  body.innerHTML = SAMPLE_ORDERS.slice(0,5).map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.product}</td>
      <td>${formatNaira(o.amount)}</td>
      <td>${statusPillHTML(o.payment)}</td>
      <td>${statusPillHTML(o.status)}</td>
    </tr>`).join("");
}

function renderAdminProducts(){
  const body = document.querySelector("#products-table-body");
  if (!body) return;
  body.innerHTML = PRODUCTS.map(p => `
    <tr>
      <td><img src="${p.images[0]}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatNaira(p.price)}</td>
      <td>${totalStock(p)} pairs</td>
      <td>${p.active === false ? statusPillHTML("cancelled") : statusPillHTML("delivered")}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openProductModal('${p.id}')">Edit</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="handleDeleteProduct('${p.id}', '${p.name.replace(/'/g,"\\'")}')">Delete</button>
      </td>
    </tr>`).join("");
}

function handleDeleteProduct(id, name){
  if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
  deleteProduct(id);
  showToast(`${name} deleted.`);
  renderAdminProducts();
  renderAdminInventory();
  renderDashboard();
}

function renderAdminInventory(){
  const body = document.querySelector("#inventory-table-body");
  if (!body) return;
  let rows = [];
  PRODUCTS.forEach(p => {
    p.sizes.forEach(s => {
      const status = s.stock === 0 ? "Out of Stock" : s.stock <= 3 ? "Low Stock" : "In Stock";
      const cls = s.stock === 0 ? "cancelled" : s.stock <= 3 ? "pending" : "delivered";
      rows.push(`
        <tr>
          <td>${p.name}</td>
          <td>${s.size}</td>
          <td>
            <input type="number" value="${s.stock}" min="0" style="width:70px; padding:6px 8px; border:1px solid var(--line); border-radius:6px;"
              onchange="handleStockChange('${p.id}', ${s.size}, this.value)">
          </td>
          <td><span id="stock-status-${p.id}-${s.size}">${statusPillHTML(cls)}</span></td>
        </tr>`);
    });
  });
  body.innerHTML = rows.join("");
}

function handleStockChange(productId, size, value){
  updateStock(productId, size, value);
  const stock = Math.max(0, Number(value) || 0);
  const cls = stock === 0 ? "cancelled" : stock <= 3 ? "pending" : "delivered";
  const label = document.querySelector(`#stock-status-${productId}-${size}`);
  if (label) label.innerHTML = statusPillHTML(cls);
  showToast("Stock updated.");
  renderDashboard();
}

function renderAdminOrders(){
  const body = document.querySelector("#orders-table-body");
  if (!body) return;
  body.innerHTML = SAMPLE_ORDERS.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.product}</td>
      <td>${formatNaira(o.amount)}</td>
      <td>${statusPillHTML(o.payment)}</td>
      <td>
        <select onchange="alert('Would update order #${o.id} status to ' + this.value + ' in Supabase.')" style="border:1px solid var(--line); border-radius:6px; padding:6px 10px;">
          ${["pending","paid","processing","shipped","delivered","cancelled"].map(s => `<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join("")}
        </select>
      </td>
      <td>${o.date}</td>
    </tr>`).join("");
}

function renderAdminCustomers(){
  const body = document.querySelector("#customers-table-body");
  if (!body) return;
  body.innerHTML = SAMPLE_CUSTOMERS.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.orders}</td>
      <td>${formatNaira(c.spent)}</td>
      <td>${c.last}</td>
    </tr>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  renderAdminProducts();
  renderAdminInventory();
  renderAdminOrders();
  renderAdminCustomers();
});
