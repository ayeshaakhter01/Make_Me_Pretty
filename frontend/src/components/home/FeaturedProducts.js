import { jsx, jsxs } from "react/jsx-runtime";
import { useProducts } from "@/lib/hooks.js";
import { getBestsellers } from "@/lib/catalog.js";
import ProductScroller from "@/components/home/ProductScroller.js";
import Button from "@/components/ui/Button.js";
import Reveal from "@/components/ui/Reveal.js";
function FeaturedProducts() {
  const { data: products } = useProducts();
  const bestsellers = getBestsellers(products);
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1200px] px-5 py-16", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mb-8 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Customer favourites" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "The Bestsellers" })
      ] }),
      /* @__PURE__ */ jsx(Button, { href: "/shop", variant: "ghost", size: "sm", children: "View all products" })
    ] }),
    /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsx(ProductScroller, { products: bestsellers }) })
  ] });
}
export {
  FeaturedProducts as default
};
