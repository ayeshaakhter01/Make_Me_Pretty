import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { categoryHref } from "@/lib/utils.js";
function MegaMenu({ category, onNavigate }) {
  if (!category) return null;
  return /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-full z-50 w-[min(760px,92vw)] -translate-x-1/2 pt-4", children: /* @__PURE__ */ jsx("div", { className: "animate-fadeup overflow-hidden rounded-3xl border border-line bg-cream shadow-menu", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1.6fr_1fr]", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-7", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose", children: category.name }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-1", children: category.types.map((type) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: categoryHref(category.name, type),
          onClick: onNavigate,
          className: "group flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] text-ink transition-colors hover:bg-pink-soft",
          children: [
            /* @__PURE__ */ jsx("span", { children: type }),
            /* @__PURE__ */ jsx("span", { className: "translate-x-[-4px] text-rose opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100", children: "\u2192" })
          ]
        },
        type
      )) }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: categoryHref(category.name),
          onClick: onNavigate,
          className: "mt-4 inline-block border-b-[1.5px] border-transparent pb-0.5 text-sm font-medium text-rose transition-colors hover:border-rose",
          children: [
            "Shop all ",
            category.name,
            " \u2192"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between bg-pink-soft p-7", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2 text-2xl text-rose", children: "\u273F" }),
        /* @__PURE__ */ jsx("div", { className: "font-serif text-xl", children: category.featured.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-ink-soft", children: category.featured.copy })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-[11px] uppercase tracking-[0.14em] text-ink-soft", children: category.blurb })
    ] })
  ] }) }) });
}
export {
  MegaMenu as default
};
