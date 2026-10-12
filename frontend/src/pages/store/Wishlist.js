import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext.js";
import ProductGrid from "@/components/product/ProductGrid.js";
import EmptyState from "@/components/ui/EmptyState.js";
import Button from "@/components/ui/Button.js";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
function WishlistPage() {
  const { wishlist, hydrated } = useCart();
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    apiFetch("/api/products", { cache: "no-store" }).then((r) => r.json()).then((d) => setCatalog(d.products || [])).catch(() => setCatalog([]));
  }, []);
  const byId = new Map((catalog || []).map((p) => [String(p.id), p]));
  const products = wishlist.map((id) => byId.get(String(id))).filter(Boolean);
  const loading = !hydrated || catalog === null;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[40px] font-normal", children: "Your Wishlist" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-soft", children: products.length > 0 ? `${products.length} saved ${products.length === 1 ? "product" : "products"} \u2014 tap the heart on any card to add or remove.` : "Tap the \u2661 on any product to save it here for later." })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) }) : products.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u2661",
        title: "Nothing saved yet",
        message: "Browse the collection and tap the heart on anything you love \u2014 it\u2019ll wait for you here.",
        children: /* @__PURE__ */ jsx(Button, { href: "/shop", size: "sm", children: "Explore the collection" })
      }
    ) : /* @__PURE__ */ jsx(ProductGrid, { products })
  ] });
}
export {
  WishlistPage as default
};
