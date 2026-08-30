-- ============================================================
-- YEMOLAM SHOES — Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PRODUCTS ----------
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric not null,
  compare_price numeric,
  category text not null,
  brand text default 'Yemolam',
  color text,
  main_image text,
  featured boolean default false,
  best_seller boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  position int default 0
);

create table product_sizes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size int not null
);

create table inventory (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size int not null,
  stock int not null default 0 check (stock >= 0),
  unique(product_id, size)
);

-- ---------- ORDERS ----------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  city text not null,
  state text not null,
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  discount numeric not null default 0,
  total_amount numeric not null,
  payment_reference text,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed')),
  order_status text default 'pending' check (order_status in ('pending','paid','processing','shipped','delivered','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  size int not null,
  quantity int not null,
  price numeric not null,
  subtotal numeric not null
);

-- ---------- SETTINGS (delivery fees, WhatsApp number, etc.) ----------
create table settings (
  key text primary key,
  value jsonb not null
);
insert into settings (key, value) values
  ('delivery_fees', '{"Lagos": 3000, "Abuja": 5000, "Other": 7000}'),
  ('whatsapp_number', '"2348169321538"');

-- ============================================================
-- ATOMIC STOCK DECREMENT — prevents overselling under concurrency
-- ============================================================
create or replace function decrement_stock(p_product_id uuid, p_size int, p_quantity int)
returns void as $$
begin
  update inventory
  set stock = stock - p_quantity
  where product_id = p_product_id and size = p_size and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for product % size %', p_product_id, p_size;
  end if;
end;
$$ language plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_sizes enable row level security;
alter table inventory enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table settings enable row level security;

-- Public (anon) can READ active products/images/sizes/inventory only.
create policy "Public read active products" on products for select using (active = true);
create policy "Public read product images" on product_images for select using (true);
create policy "Public read product sizes" on product_sizes for select using (true);
create policy "Public read inventory" on inventory for select using (true);
create policy "Public read settings" on settings for select using (true);

-- Only authenticated admins (service role, used by backend functions) can write.
-- No insert/update/delete policies are created for the anon/public role,
-- which means writes are only possible via the Supabase service role key
-- from your backend/serverless functions — never from the browser.

create policy "Admins manage products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admins manage inventory" on inventory for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admins manage orders" on orders for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admins manage order_items" on order_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admins manage settings" on settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Customers should never directly write orders from the browser — orders
-- are always created via the backend (/api/create-order) using the
-- service role key, which bypasses RLS by design.
