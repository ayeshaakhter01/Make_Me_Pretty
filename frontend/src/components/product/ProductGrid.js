import { jsx } from "react/jsx-runtime";
import ProductCard from "@/components/product/ProductCard.js";
function ProductGrid({ products, animate = true }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", children: products.map((p, i) => /* @__PURE__ */ jsx(
    "div",
    {
      className: animate ? "animate-fadeup" : void 0,
      style: animate ? { animationDelay: `${Math.min(i, 8) * 0.05}s` } : void 0,
      children: /* @__PURE__ */ jsx(ProductCard, { product: p })
    },
    p.id
  )) });
}
export {
  ProductGrid as default
};
