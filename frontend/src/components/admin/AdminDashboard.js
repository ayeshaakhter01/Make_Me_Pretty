import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext.js";
import { bdt } from "@/lib/format.js";
import AdminSidebar from "@/components/admin/AdminSidebar.js";
import StatCard from "@/components/admin/StatCard.js";
import OrdersTable from "@/components/admin/OrdersTable.js";
import InventoryManager from "@/components/admin/InventoryManager.js";
import BehaviourPanel from "@/components/admin/BehaviourPanel.js";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel.js";
import CouponManager from "@/components/admin/CouponManager.js";
import BannersManager from "@/components/admin/BannersManager.js";
import ReviewsPanel from "@/components/admin/ReviewsPanel.js";
import BlogManager from "@/components/admin/BlogManager.js";
function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const refreshProducts = () => apiFetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => setProducts([]));
  useEffect(() => {
    apiFetch("/api/admin/orders", { cache: "no-store" }).then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(() => setOrders([]));
    refreshProducts();
  }, []);
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.pay === "Paid");
    const revenue = paid.reduce((s, o) => s + o.total, 0);
    const low = products.filter((p) => p.stock <= 5).length;
    const avg = paid.length ? Math.round(revenue / paid.length) : 0;
    return { revenue, count: orders.length, avg, low };
  }, [orders, products]);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-ivory", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-6 lg:flex-row", children: [
    /* @__PURE__ */ jsx(AdminSidebar, { active: tab, onChange: setTab }),
    /* @__PURE__ */ jsxs("main", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-serif text-[30px] font-normal", children: "Store Dashboard" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink-soft", children: [
          "Welcome back",
          user?.name ? `, ${user.name}` : "",
          " \u2014 here\u2019s how Make Me Pretty is doing today."
        ] })
      ] }),
      (tab === "Orders" || tab === "Analytics") && /* @__PURE__ */ jsxs("div", { className: "mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Revenue (paid)", value: bdt(stats.revenue), accent: "var(--rose)" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Orders", value: stats.count }),
        /* @__PURE__ */ jsx(StatCard, { label: "Avg. order", value: bdt(stats.avg), accent: "var(--gold)" }),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Low-stock alerts",
            value: stats.low,
            accent: stats.low ? "#B3543D" : "var(--ink)"
          }
        )
      ] }),
      tab === "Orders" && /* @__PURE__ */ jsx(OrdersTable, { orders, setOrders }),
      tab === "Inventory" && /* @__PURE__ */ jsx(InventoryManager, { products, onRefresh: refreshProducts }),
      tab === "Behaviour" && /* @__PURE__ */ jsx(BehaviourPanel, {}),
      tab === "Analytics" && /* @__PURE__ */ jsx(AnalyticsPanel, { orders }),
      tab === "Coupons" && /* @__PURE__ */ jsx(CouponManager, {}),
      tab === "Banners" && /* @__PURE__ */ jsx(BannersManager, {}),
      tab === "Reviews" && /* @__PURE__ */ jsx(ReviewsPanel, {}),
      tab === "Blog" && /* @__PURE__ */ jsx(BlogManager, {})
    ] })
  ] }) });
}
export {
  AdminDashboard as default
};
