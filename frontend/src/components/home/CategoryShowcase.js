import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { CATEGORIES } from "@/data/categories.js";
import { useProducts } from "@/lib/hooks.js";
import { getByCategory } from "@/lib/catalog.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import StaggerReveal from "@/components/ui/StaggerReveal.js";
import Reveal from "@/components/ui/Reveal.js";
import { categoryHref } from "@/lib/utils.js";
function CategoryShowcase() {
  const { data: products } = useProducts();
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[1200px] px-5 py-16", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mb-9 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Shop by category" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "Find your ritual" })
    ] }),
    /* @__PURE__ */ jsx(StaggerReveal, { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: CATEGORIES.map((cat) => {
      const sample = getByCategory(products, cat.name)[0];
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: categoryHref(cat.name),
          className: "group flex flex-col items-center rounded-3xl border border-line bg-cream p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft",
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "card-shine mb-4 flex aspect-square w-full items-center justify-center rounded-2xl",
                style: {
                  background: `linear-gradient(160deg, ${sample?.c1 || "#F6DEE3"}, #fff 130%)`
                },
                children: /* @__PURE__ */ jsx(
                  ProductPlaceholder,
                  {
                    shape: sample?.shape || "jar",
                    c1: sample?.c1,
                    c2: sample?.c2,
                    size: 0.7
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "font-serif text-lg", children: cat.name }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-[12.5px] text-ink-soft", children: cat.blurb })
          ]
        },
        cat.name
      );
    }) })
  ] });
}
export {
  CategoryShowcase as default
};
