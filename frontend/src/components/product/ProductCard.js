import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import { ProductBadge } from "@/components/ui/Badge.js";
import StarRating from "@/components/product/StarRating.js";
import PriceTag from "@/components/product/PriceTag.js";
import WishlistButton from "@/components/product/WishlistButton.js";
import QuickAddButton from "@/components/product/QuickAddButton.js";
import { discountPct } from "@/lib/format.js";
function ProductCard({ product: p }) {
  const off = discountPct(p.price, p.old);
  const photo = (p.media || []).find((m) => m.type === "image");
  return /* @__PURE__ */ jsxs("div", { className: "group", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: `/product/${p.id}`,
        className: "block transition-transform duration-300 ease-out group-hover:-translate-y-1.5",
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "card-shine relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-line transition-all duration-300 group-hover:border-rose/30 group-hover:shadow-lift",
              style: { background: `linear-gradient(160deg, ${p.c1}, #fff 130%)` },
              children: [
                photo ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: photo.src,
                    alt: p.name,
                    className: "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "animate-floaty", children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2 }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute left-4 top-4", children: /* @__PURE__ */ jsx(ProductBadge, { badge: p.badge, stock: p.stock }) }),
                off > 0 && /* @__PURE__ */ jsxs("span", { className: "absolute bottom-4 left-4 rounded-full bg-rose px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white", children: [
                  "-",
                  off,
                  "%"
                ] }),
                /* @__PURE__ */ jsx(WishlistButton, { productId: p.id, floating: true })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "px-1.5 pt-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.16em] text-ink-soft", children: p.type }),
            /* @__PURE__ */ jsx("div", { className: "mb-1 mt-1 font-serif text-[19px] leading-snug", children: p.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(StarRating, { value: p.rating }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-soft", children: [
                "(",
                p.reviews,
                ")"
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mt-2.5 flex items-center justify-between px-1.5", children: [
      /* @__PURE__ */ jsx(PriceTag, { price: p.price, old: p.old }),
      /* @__PURE__ */ jsx(QuickAddButton, { product: p })
    ] })
  ] });
}
export {
  ProductCard as default
};
