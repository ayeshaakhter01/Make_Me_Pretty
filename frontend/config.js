/* ---- How the frontend gets its data ------------------------------------
   DEMO: true   -> NO backend needed. A fake API runs inside the browser with
                   sample products; accounts, cart, orders and admin product
                   edits are kept in localStorage. Demo logins:
                     admin  -> #/admin   admin@makemepretty.com / admin123
                     coupon -> GLOW20
   DEMO: false  -> talk to the real backend at API_URL.
------------------------------------------------------------------------- */
window.MMP_CONFIG = {
  DEMO: true,
  API_URL: "http://localhost:4000", // used only when DEMO is false ("" = same origin)
};
