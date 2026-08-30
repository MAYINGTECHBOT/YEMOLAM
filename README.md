# Yemolam Shoes — E-Commerce Store

A premium, mobile-first shoe e-commerce site: browse → pick size → cart → checkout → pay (Paystack) → order confirmation, plus a full admin dashboard for products, inventory, orders, and customers.

**Status:** the frontend (customer store + admin UI) is fully built and functional using sample data and local storage. The backend integration points (Supabase + Paystack) are wired up in code with clear `TODO`/`DEMO MODE` markers — you need to add your own project keys to go live. Checkout currently runs in **demo mode** (simulates a successful payment) so you can review the whole flow before connecting real services.

---

## 1. Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no build step needed)
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage) — schema in `supabase/schema.sql`
- **Payments:** Paystack — serverless functions in `/api`
- **Hosting:** Netlify or Vercel (frontend) + Vercel/Netlify Functions (backend)

---

## 2. Project Structure

```
yemolam-shoes/
├── index.html, shop.html, product.html, cart.html,
│   checkout.html, success.html, about.html, contact.html,
│   privacy.html, terms.html
├── admin/
│   ├── login.html, dashboard.html, products.html,
│   ├── inventory.html, orders.html, customers.html, settings.html
├── css/style.css
├── js/
│   ├── main.js, cart.js, products.js, products-data.js,
│   ├── product-page.js, checkout.js, auth.js, admin.js, admin-data.js
├── api/
│   ├── create-order.js         (creates order, calls Paystack)
│   └── paystack-verify.js      (verifies payment, updates stock)
├── supabase/schema.sql          (tables, RLS policies, stock function)
├── .env.example
└── .gitignore
```

---

## 3. Keys & Values You Need to Fill In

| Variable | Where to get it | Used in |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API | backend + Supabase Auth |
| `SUPABASE_ANON_KEY` | Same page | frontend (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page | **backend only** — never in frontend code |
| `PAYSTACK_PUBLIC_KEY` | Paystack Dashboard → Settings → API Keys | `js/checkout.js` (already has a placeholder to replace) |
| `PAYSTACK_SECRET_KEY` | Same page | **backend only** — used in `/api/create-order.js` and `/api/paystack-verify.js` |
| `EMAIL_API_KEY` | Your email provider (Resend/Postmark/SendGrid) | order confirmation emails |
| `WHATSAPP_NUMBER` | Your business WhatsApp number, digits only, country code first | `js/main.js` `CONFIG.whatsappNumber`, and Admin → Settings |
| `PUBLIC_SITE_URL` | Your live domain once deployed | Paystack callback URL |

Copy `.env.example` to `.env` and fill these in. **Never commit `.env`.**

---

## 4. Local Setup

1. **Supabase project:** create one at supabase.com, then open the SQL Editor and run the contents of `supabase/schema.sql`. This creates all tables, the atomic `decrement_stock` function (prevents overselling), and Row Level Security policies.
2. **Storage bucket:** in Supabase Storage, create a public bucket called `product-images` for product photos.
3. **Admin user:** in Supabase Auth, create at least one user (your email + password) — this is who can log into `/admin`.
4. **Paystack:** create an account at paystack.com, grab your **test** keys first from Settings → API Keys & Webhooks.
5. **Fill in `.env`** with all the values above.
6. **Frontend:** just open `index.html` in a browser, or serve the folder with any static server (e.g. `npx serve`). No build step required.
7. **Backend functions:** the files in `/api` are written as Vercel/Node serverless functions. If deploying to Vercel, they work as-is. If using Netlify, move them into `netlify/functions/` and adjust the `req`/`res` handler signature to Netlify's format (or ask your developer to do this conversion).

---

## 5. Connecting Real Data (replacing demo mode)

Three files currently run on **sample/local data** and need to be swapped for real Supabase calls:

- `js/products-data.js` → replace the `PRODUCTS` array with a Supabase query (`supabase.from('products').select(...)`).
- `js/admin-data.js` → replace `SAMPLE_ORDERS` / `SAMPLE_CUSTOMERS` with real Supabase queries.
- `js/auth.js` → replace the demo login handler with `supabase.auth.signInWithPassword(...)` (the exact code is commented in the file).
- `js/checkout.js` → replace the "DEMO MODE" block with a real `fetch('/api/create-order')` call (also commented in the file, ready to uncomment).

Every one of these has a comment block showing the exact production code to drop in.

---

## 6. Deployment

1. Push this repo to GitHub (`.env` is git-ignored automatically).
2. **Frontend:** connect the repo to Vercel or Netlify. No build command needed for the static pages — set the publish directory to the project root.
3. **Backend:** if using Vercel, the `/api` folder deploys automatically as serverless functions. Add all `.env` variables in Vercel → Project Settings → Environment Variables.
4. **Custom domain:** add it in your hosting provider's dashboard and update `PUBLIC_SITE_URL`.
5. **Test payments:** use Paystack's test cards (found in their docs) against your **test** keys until everything works end-to-end.
6. **Go live:** switch `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY` to your **live** keys, and switch the Paystack dashboard toggle to Live Mode.

---

## 7. Design Notes

- **Palette:** espresso `#201510`, leather `#6b3f2a`, tan `#c89b6f`, cream `#f6efe4`, rust accent `#b8562f` — a warm, premium leather-goods palette rather than a generic tech-startup look.
- **Type:** Fraunces (display) + Inter (body/UI).
- **Signature detail:** a stitched dash underline (`.stitch-underline`) echoes shoe stitching, used sparingly on key headlines.
- All product photography is placeholder (`placehold.co`) — replace with real photos before launch. Do not use copyrighted brand imagery.

---

## 8. Admin Product & Inventory Management (now functional)

`admin/products.html` and `admin/inventory.html` are fully working today, backed by `js/admin-store.js`, which persists everything to the browser's `localStorage` (key `yemolam_products`) so changes survive a refresh:

- **Add Product** — opens a real form (name, category, description, price, compare-at price, brand, color, multiple images via file upload, per-size stock, featured/best-seller/active toggles). Saving actually creates the product and it appears immediately on the storefront (Shop, Home, product pages).
- **Edit Product** — pre-fills the same form and updates the existing product in place.
- **Delete Product** — removes it after a confirmation prompt.
- **Inventory page** — stock number inputs save on change and instantly update the in-stock/low-stock/out-of-stock badge and the dashboard's "Low Stock Items" count.
- **Settings page** — delivery fees and the WhatsApp number are saved to `localStorage` (`yemolam_settings`) and immediately apply across the storefront (checkout delivery fee, WhatsApp buttons everywhere).

**Swapping this for Supabase:** every function in `js/admin-store.js` (`addProduct`, `updateProduct`, `deleteProduct`, `updateStock`) has a comment showing the exact Supabase call to drop in — the function signatures are designed to stay the same, so `admin.js` and the product form don't need to change. Product images are currently stored as base64 data URLs (fine for local testing); in production, upload the file to the Supabase `product-images` Storage bucket instead and store the returned public URL.

## 9. Known Limitations / What's Left for Go-Live

- Checkout is in demo mode until `/api/create-order` + `/api/paystack-verify` are deployed with real keys.
- Order/customer data in the admin dashboard is still sample data until `js/admin-data.js` is pointed at Supabase (products/inventory are already live via `js/admin-store.js`, see above).
- Email notifications are stubbed (`TODO` in `paystack-verify.js`) — plug in your provider of choice.
- Admin login accepts any submission in demo mode — real Supabase Auth must be wired in before this goes live (see `js/auth.js`).
- `localStorage` is per-browser — product changes made in Admin on one device won't appear on another until Supabase is connected.
