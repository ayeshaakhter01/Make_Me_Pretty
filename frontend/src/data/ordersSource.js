/* Seed orders — used by the admin dashboard, order tracking, and account history.
   status is an index into ORDER_STATUSES (lib/utils.js). */

export const SEED_ORDERS = [
  {
    id: "AR-1042", name: "Nusrat J.", phone: "01712345678", total: 2700,
    method: "bKash", pay: "Paid", status: 2, items: 2, date: "Jul 2",
    lines: [
      { name: "Silk Barrier Moisturizer", qty: 1, price: 1250 },
      { name: "Niacinamide 10% Serum", qty: 1, price: 1450 },
    ],
  },
  {
    id: "AR-1041", name: "Farhana R.", phone: "01898765432", total: 1350,
    method: "COD", pay: "Pending", status: 1, items: 1, date: "Jul 2",
    lines: [{ name: "SPF 50 Silk Shield", qty: 1, price: 1350 }],
  },
  {
    id: "AR-1040", name: "Tasnim A.", phone: "01611223344", total: 4150,
    method: "Nagad", pay: "Paid", status: 3, items: 3, date: "Jul 1",
    lines: [
      { name: "Vitamin C Glow Drops", qty: 1, price: 1650 },
      { name: "Ceramide Night Cream", qty: 1, price: 1550 },
      { name: "Hydra Mist Toner", qty: 1, price: 950 },
    ],
  },
  {
    id: "AR-1039", name: "Maliha K.", phone: "01555667788", total: 950,
    method: "Card", pay: "Paid", status: 4, items: 1, date: "Jun 30",
    lines: [{ name: "Hydra Mist Toner", qty: 1, price: 950 }],
  },
];

/* Coupons for the admin coupon manager */
export const SEED_COUPONS = [
  { code: "GLOW20", type: "percent", value: 20, active: true, note: "Monsoon Glow Sale — all serums" },
  { code: "WELCOME10", type: "percent", value: 10, active: true, note: "First order discount" },
  { code: "FREESHIP", type: "shipping", value: 0, active: false, note: "Free delivery, any order" },
];
