import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useParams } from "react-router-dom";
import { useProducts } from "@/lib/hooks.js";
import { findProduct, getRelated, findPromoCoupon } from "@/lib/catalog.js";
import { useSettings } from "@/context/SettingsContext.js";
import { useTitle } from "@/lib/useTitle.js";
import NotFound from "@/pages/NotFound.js";
import { PRODUCT_REVIEWS } from "@/data/reviews.js";
import { bdt } from "@/lib/format.js";
import { ProductBadge } from "@/components/ui/Badge.js";
import Badge from "@/components/ui/Badge.js";
import StarRating from "@/components/product/StarRating.js";
import ProductGallery from "@/components/product/ProductGallery.js";
import IngredientTags from "@/components/product/IngredientTags.js";
import AddToCartPanel from "@/components/product/AddToCartPanel.js";
import ProductGrid from "@/components/product/ProductGrid.js";
function ProductPage() {
  const { id } = useParams();
  const { data: products, loading } = useProducts();
  const { coupons } = useSettings();
  const product = findProduct(products, id);
  useTitle(product ? product.name : loading ? "Product" : "Product not found");
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1200px] px-5 py-10", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-2 md:gap-12", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-square skel rounded-card" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-5 w-40 skel rounded-lg" }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-3/4 skel rounded-lg" }),
        /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-lg" })
      ] })
    ] }) });
  }
  if (!product) return /* @__PURE__ */ jsx(NotFound, {});
  const related = getRelated(products, product);
  const promoCoupon = findPromoCoupon(coupons);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-10", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href: "/shop",
        className: "mb-6 inline-block text-sm text-ink-soft transition-colors hover:text-rose",
        children: "\u2190 Back to collection"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-2 md:gap-12", children: [
      /* @__PURE__ */ jsx(ProductGallery, { product }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(ProductBadge, { badge: product.badge, stock: product.stock }),
          product.stock > 5 ? /* @__PURE__ */ jsx(Badge, { tone: "neutral", children: "In stock" }) : product.stock > 0 ? /* @__PURE__ */ jsxs(Badge, { tone: "low", children: [
            "Only ",
            product.stock,
            " left"
          ] }) : /* @__PURE__ */ jsx(Badge, { tone: "low", children: "Sold out" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 text-[11px] uppercase tracking-[0.16em] text-ink-soft", children: [
          product.category,
          " \xB7 ",
          product.type
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-1 font-serif text-[36px] font-normal leading-tight", children: product.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(StarRating, { value: product.rating }),
          /* @__PURE__ */ jsxs("span", { className: "text-[13px] text-ink-soft", children: [
            product.rating,
            " \xB7 ",
            product.reviews,
            " verified reviews"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "my-5 text-2xl font-semibold", children: [
          bdt(product.price),
          product.old && /* @__PURE__ */ jsx("span", { className: "ml-2 text-base font-normal text-ink-soft line-through", children: bdt(product.old) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[15.5px] leading-[1.75] text-ink-soft", children: product.desc }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft", children: [
          "Best for \xB7 ",
          product.skin
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-7", children: /* @__PURE__ */ jsx(IngredientTags, { ingredients: product.ing }) }),
        /* @__PURE__ */ jsx(AddToCartPanel, { product }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-card border border-line bg-cream p-5 text-[13.5px] leading-[1.8] text-ink-soft", children: [
          "\u{1F69A} Delivery in 1\u20132 days inside Dhaka \xB7 2\u20134 days nationwide",
          /* @__PURE__ */ jsx("br", {}),
          "\u{1F4B3} bKash \xB7 Nagad \xB7 Cards \xB7 Cash on Delivery",
          /* @__PURE__ */ jsx("br", {}),
          "\u21A9 7-day easy returns on unopened products",
          promoCoupon && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsxs("span", { className: "text-rose", children: [
              "\u2726 Use code ",
              promoCoupon.code,
              " \u2014",
              " ",
              promoCoupon.type === "shipping" ? "free delivery" : `${promoCoupon.value}% off`
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-6 font-serif text-[28px] font-normal", children: "What customers say" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: PRODUCT_REVIEWS.map((r, i) => /* @__PURE__ */ jsxs("figure", { className: "rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx(StarRating, { value: r.rating }),
        /* @__PURE__ */ jsxs("blockquote", { className: "my-3 text-[14.5px] leading-relaxed", children: [
          "\u201C",
          r.text,
          "\u201D"
        ] }),
        /* @__PURE__ */ jsxs("figcaption", { className: "text-[13px] text-ink-soft", children: [
          r.name,
          " \xB7",
          " ",
          r.verified && /* @__PURE__ */ jsx("span", { className: "text-gold", children: "\u2713 Verified purchase" })
        ] })
      ] }, i)) })
    ] }),
    related.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-6 font-serif text-[28px] font-normal", children: "Complete the ritual" }),
      /* @__PURE__ */ jsx(ProductGrid, { products: related, animate: false })
    ] })
  ] });
}
export {
  ProductPage as default
};
