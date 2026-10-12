import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { TruckFastIcon, CreditCardIcon } from "@/components/promo/InfoIcons.js";
import { useParams } from "react-router-dom";
import { useCombos } from "@/lib/hooks.js";
import { findCombo, findPromoCoupon } from "@/lib/catalog.js";
import { useSettings } from "@/context/SettingsContext.js";
import { useTitle } from "@/lib/useTitle.js";
import NotFound from "@/pages/NotFound.js";
import { bdt } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import AddComboButton from "@/components/combo/AddComboButton.js";
function MemberVisual({ p, size = 0.7 }) {
  const img = (p.media || []).find((m) => m.type !== "video");
  if (img) {
    return /* @__PURE__ */ jsx("img", { src: img.src, alt: p.name, className: "h-full w-full object-cover" });
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "flex h-full w-full items-center justify-center",
      style: { background: `linear-gradient(160deg, ${p.c1}, #fff)` },
      children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2, size })
    }
  );
}
function ComboDetailPage() {
  const { id } = useParams();
  const { data: combos, loading } = useCombos();
  const { coupons } = useSettings();
  const combo = findCombo(combos, id);
  useTitle(combo ? `${combo.name} \u2014 Combo set` : loading ? "Combo" : "Combo not found");
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1200px] px-5 py-10", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-2 md:gap-12", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-square skel rounded-card" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-3/4 skel rounded-lg" }),
        /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-lg" })
      ] })
    ] }) });
  }
  if (!combo) return /* @__PURE__ */ jsx(NotFound, {});
  const saves = combo.originalTotal - combo.price;
  const promoCoupon = findPromoCoupon(coupons);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-10", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href: "/combo",
        className: "mb-6 inline-block text-sm text-ink-soft transition-colors hover:text-rose",
        children: "\u2190 Back to combo sets"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-2 md:gap-12", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 rounded-card bg-pink-soft/50 p-4", children: combo.products.slice(0, 4).map((p) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "aspect-square overflow-hidden rounded-2xl border border-white/70 bg-white shadow-soft",
            children: /* @__PURE__ */ jsx(MemberVisual, { p })
          },
          p.id
        )) }),
        combo.products.length > 4 && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-center text-[12px] text-ink-soft", children: [
          "+ ",
          combo.products.length - 4,
          " more inside"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { tone: "neutral", children: "Combo set" }),
          combo.inStock ? /* @__PURE__ */ jsx(Badge, { tone: "neutral", children: "In stock" }) : /* @__PURE__ */ jsx(Badge, { tone: "low", children: "Out of stock" }),
          saves > 0 && /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]", children: [
            "Save ",
            bdt(saves)
          ] })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-[36px] font-normal leading-tight", children: combo.name }),
        /* @__PURE__ */ jsxs("div", { className: "my-5 flex items-end gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-semibold", children: bdt(combo.price) }),
          saves > 0 && /* @__PURE__ */ jsx("span", { className: "text-base font-normal text-ink-soft line-through", children: bdt(combo.originalTotal) })
        ] }),
        combo.description && /* @__PURE__ */ jsx("p", { className: "text-[15.5px] leading-[1.75] text-ink-soft", children: combo.description }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft", children: [
          "What's inside \xB7 ",
          combo.products.length,
          " products"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "divide-y divide-line overflow-hidden rounded-card border border-line bg-cream", children: combo.products.map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/product/${p.id}`,
            className: "group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-pink-soft/50",
            children: [
              /* @__PURE__ */ jsx("span", { className: "h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-white", children: /* @__PURE__ */ jsx(MemberVisual, { p, size: 0.42 }) }),
              /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-[14px] group-hover:text-rose", children: p.name }),
              /* @__PURE__ */ jsx("span", { className: "text-[13px] text-ink-soft", children: bdt(p.price) }),
              /* @__PURE__ */ jsx("span", { className: "text-rose opacity-0 transition-opacity group-hover:opacity-100", children: "\u2192" })
            ]
          }
        ) }, p.id)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(AddComboButton, { combo, className: "w-full !py-3.5 !text-[15px]", children: [
          "Add bundle to bag \xB7 ",
          bdt(combo.price)
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-card border border-line bg-cream p-5 text-[13.5px] leading-[1.8] text-ink-soft", children: [
          /* @__PURE__ */ jsx(TruckFastIcon, {}),
          "Delivery in 1\u20132 days inside Dhaka \xB7 2\u20134 days nationwide",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx(CreditCardIcon, {}),
          "bKash \xB7 Nagad \xB7 Cards \xB7 Cash on Delivery",
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
    ] })
  ] });
}
export {
  ComboDetailPage as default
};
