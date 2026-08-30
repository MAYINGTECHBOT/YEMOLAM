/**
 * ADMIN AUTHENTICATION — Supabase
 * -----------------------------------------------------------------
 * Replace the DEMO block below with real Supabase Auth once your
 * project keys are added. Example production version:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *
 *   const { data, error } = await supabase.auth.signInWithPassword({
 *     email, password
 *   });
 *   if (error) { showLoginError(); return; }
 *   window.location.href = "dashboard.html";
 *
 * Every admin/*.html page should also check for a valid session on
 * load and redirect to login.html if none exists:
 *
 *   const { data: { session } } = await supabase.auth.getSession();
 *   if (!session) window.location.href = "login.html";
 *
 * Row Level Security in Supabase must additionally restrict writes
 * to products/orders/inventory tables to authenticated admin users
 * only — see /supabase/schema.sql for the RLS policies.
 */

function showLoginError(){
  const err = document.querySelector("#login-error");
  if (err) err.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#login-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // DEMO MODE ONLY — replace with Supabase signInWithPassword above.
    console.warn("[Yemolam] Demo mode: no Supabase Auth connected. Allowing access for preview.");
    window.location.href = "dashboard.html";
  });
});

function requireAdminSession(){
  // Placeholder guard for demo pages. Replace with real session check.
  console.warn("[Yemolam] Demo mode: admin route guard not yet connected to Supabase Auth.");
}
