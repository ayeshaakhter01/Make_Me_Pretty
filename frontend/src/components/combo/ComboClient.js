import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import EmptyState from "@/components/ui/EmptyState.js";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
import AddComboButton from "@/components/combo/AddComboButton.js";
import { bdt } from "@/lib/format.js";
function ComboClient() {
  const [combos, setCombos] = useState(null);
  useEffect(() => {
    let active = true;
    apiFetch("/api/combos", { cache: "no-store" }).then((r) => r.json()).then((d) => active && setCombos(d.combos || [])).catch(() => active && setCombos([]));
    return () => {
      active = false;
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1200px] px-5 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-9 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Better together" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-2 font-serif text-[clamp(30px,4.5vw,42px)] font-normal", children: "Combo sets" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[14px] text-ink-soft", children: "Curated bundles at a set price \u2014 everything your ritual needs, in one tap." })
    ] }),
    combos === null ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) }) : combos.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u273F",
        title: "No combos yet",
        message: "Check back soon \u2014 curated bundles are on the way."
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: combos.map((c, ci) => {
      const saves = c.originalTotal - c.price;
      return /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/combo/${c.id}`,
          className: "animate-fadeup group flex flex-col overflow-hidden rounded-card border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-soft",
          style: { animationDelay: `${Math.min(ci, 8) * 0.08}s` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "card-shine flex items-center justify-center gap-3 bg-pink-soft/60 px-5 py-7", children: c.products.slice(0, 4).map((p) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 shadow-soft",
                style: { background: `linear-gradient(160deg, ${p.c1}, #fff)` },
                children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2, size: 0.34 })
              },
              p.id
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsx("h2", { className: "font-serif text-xl leading-tight group-hover:text-rose", children: c.name }),
                saves > 0 && /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]", children: [
                  "Save ",
                  bdt(saves)
                ] })
              ] }),
              c.description && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[13px] text-ink-soft", children: c.description }),
              /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-[13px] text-ink-soft", children: c.products.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-rose", children: "\u2726" }),
                /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: p.name }),
                /* @__PURE__ */ jsx("span", { children: bdt(p.price) })
              ] }, p.id)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end justify-between border-t border-line pt-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-serif text-2xl", children: bdt(c.price) }),
                  saves > 0 && /* @__PURE__ */ jsx("div", { className: "text-[12px] text-ink-soft line-through", children: bdt(c.originalTotal) })
                ] }),
                /* @__PURE__ */ jsx(AddComboButton, { combo: c })
              ] })
            ] })
          ]
        },
        c.id
      );
    }) })
  ] });
}
export {
  ComboClient as default
};
