import { jsx, jsxs } from "react/jsx-runtime";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function Group({ title, children }) {
  return /* @__PURE__ */ jsxs("details", { open: true, className: "group border-b border-line py-4 last:border-0", children: [
    /* @__PURE__ */ jsxs("summary", { className: "flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-[0.1em] text-ink [&::-webkit-details-marker]:hidden", children: [
      title,
      /* @__PURE__ */ jsx("span", { className: "text-rose transition-transform duration-300 group-open:rotate-180", children: "\u2304" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pt-3", children })
  ] });
}
function Check({ checked, onChange, children, count }) {
  return /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-[5px] text-[13.5px] text-ink transition-colors hover:bg-pink-soft/60", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: cx(
          "flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all",
          checked ? "border-rose bg-rose text-white" : "border-line bg-cream"
        ),
        children: checked && /* @__PURE__ */ jsx("svg", { viewBox: "0 0 10 8", className: "h-2 w-2.5", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M1 4l2.5 2.5L9 1", strokeLinecap: "round", strokeLinejoin: "round" }) })
      }
    ),
    /* @__PURE__ */ jsx("input", { type: "checkbox", className: "hidden", checked, onChange }),
    /* @__PURE__ */ jsx("span", { className: "flex-1", children }),
    count !== void 0 && /* @__PURE__ */ jsxs("span", { className: "text-[11.5px] text-ink-soft", children: [
      "(",
      count,
      ")"
    ] })
  ] });
}
function FilterPanel({
  facets,
  // { types:[{v,count}], brands:[{v,count}], skins:[{v,count}], priceMax }
  filters,
  // { inStock, outStock, priceMin, priceMax, types:Set, brands:Set, skins:Set }
  set,
  // (key, value) => void
  toggleIn,
  // (setKey, value) => void
  onReset,
  activeCount
}) {
  return /* @__PURE__ */ jsxs("aside", { className: "rounded-card border border-line bg-cream px-5 py-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-line py-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: "Filters" }),
      activeCount > 0 && /* @__PURE__ */ jsxs("button", { onClick: onReset, className: "text-[12px] text-rose underline", children: [
        "Clear all (",
        activeCount,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Group, { title: "Availability", children: [
      /* @__PURE__ */ jsx(Check, { checked: filters.inStock, onChange: () => set("inStock", !filters.inStock), children: "In stock" }),
      /* @__PURE__ */ jsx(Check, { checked: filters.outStock, onChange: () => set("outStock", !filters.outStock), children: "Out of stock" })
    ] }),
    /* @__PURE__ */ jsxs(Group, { title: "Price range", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            placeholder: "Min",
            value: filters.priceMin,
            onChange: (e) => set("priceMin", e.target.value),
            className: "!px-3 !py-2 !text-[13px]"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "\u2014" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            placeholder: "Max",
            value: filters.priceMax,
            onChange: (e) => set("priceMax", e.target.value),
            className: "!px-3 !py-2 !text-[13px]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[11.5px] text-ink-soft", children: [
        "Up to ",
        bdt(facets.priceMax),
        " in this view"
      ] })
    ] }),
    /* @__PURE__ */ jsx(Group, { title: "Product type", children: facets.types.map((t) => /* @__PURE__ */ jsx(
      Check,
      {
        checked: filters.types.has(t.v),
        onChange: () => toggleIn("types", t.v),
        count: t.count,
        children: t.v
      },
      t.v
    )) }),
    /* @__PURE__ */ jsx(Group, { title: "Brand", children: facets.brands.map((b) => /* @__PURE__ */ jsx(
      Check,
      {
        checked: filters.brands.has(b.v),
        onChange: () => toggleIn("brands", b.v),
        count: b.count,
        children: b.v
      },
      b.v
    )) }),
    /* @__PURE__ */ jsx(Group, { title: "Suitable for skin type", children: facets.skins.map((s) => /* @__PURE__ */ jsx(
      Check,
      {
        checked: filters.skins.has(s.v),
        onChange: () => toggleIn("skins", s.v),
        count: s.count,
        children: s.v
      },
      s.v
    )) })
  ] });
}
export {
  FilterPanel as default
};
