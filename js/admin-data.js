/**
 * SAMPLE ADMIN DATA — for previewing the dashboard UI only.
 * In production, replace every function body here with Supabase queries, e.g.:
 *   const { data: orders } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
 */

const SAMPLE_ORDERS = [
  { id: "1001", customer: "John Doe", product: "Classic Black Sneaker (x1, Size 42)", amount: 70000, payment: "paid", status: "processing", date: "2026-08-27" },
  { id: "1002", customer: "Chidinma A.", product: "Urban White Sneaker (x1, Size 40)", amount: 80000, payment: "paid", status: "shipped", date: "2026-08-26" },
  { id: "1003", customer: "Tunde O.", product: "Premium Runner (x1, Size 43)", amount: 90000, payment: "pending", status: "pending", date: "2026-08-26" },
  { id: "1004", customer: "Amaka N.", product: "Coastline Sandal (x2, Size 41)", amount: 89000, payment: "paid", status: "delivered", date: "2026-08-24" },
  { id: "1005", customer: "Bola S.", product: "Weekend Loafer (x1, Size 44)", amount: 77000, payment: "paid", status: "cancelled", date: "2026-08-22" },
];

const SAMPLE_CUSTOMERS = [
  { name: "John Doe", email: "john@email.com", phone: "0801 111 2222", orders: 3, spent: 210000, last: "2026-08-27" },
  { name: "Chidinma A.", email: "chidinma@email.com", phone: "0802 222 3333", orders: 1, spent: 80000, last: "2026-08-26" },
  { name: "Tunde O.", email: "tunde@email.com", phone: "0803 333 4444", orders: 5, spent: 410000, last: "2026-08-26" },
  { name: "Amaka N.", email: "amaka@email.com", phone: "0804 444 5555", orders: 2, spent: 178000, last: "2026-08-24" },
];

function statusPillHTML(status){
  return `<span class="status-pill status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}
