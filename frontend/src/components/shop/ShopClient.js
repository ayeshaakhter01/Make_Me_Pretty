import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/product/ProductCard.js";
import FilterPanel from "@/components/shop/FilterPanel.js";
import InlineMediaStrip from "@/components/shop/InlineMediaStrip.js";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.js";
import EmptyState from "@/components/ui/EmptyState.js";
import Button from "@/components/ui/Button.js";
import { cx } from "@/lib/utils.js";
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: low \u2192 high" },
  { value: "high", label: "Price: high \u2192 low" },
  { value: "rated", label: "Top rated" }
];
const GRID_COLS = 4;
const EMPTY_FILTERS = {
  inStock: false,
  outStock: false,
  priceMin: "",
  priceMax: "",
  types: /* @__PURE__ */ new Set(),
  brands: /* @__PURE__ */ new Set(),
  skins: /* @__PURE__ */ new Set()
};
const skinTokens = (skin) => String(skin || "").split(/[·,]/).map((s) => s.trim()).filter(Boolean);
function ShopClient({ products = [], inlineStrips = [], fixedCategory = null, fixedOffers = false }) {
  const [params] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const filtersRef = useRef(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const onDown = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filtersOpen]);
  useEffect(() => {
    setCategory(fixedCategory || params.get("category") || "All");
    setQuery(params.get("q") || "");
    setOffersOnly(fixedOffers || params.get("offers") === "1");
    if (params.get("sort")) setSort(params.get("sort"));
    const type = params.get("type");
    const brand = params.get("brand");
    setFilters((f) => ({
      ...EMPTY_FILTERS,
      types: type ? /* @__PURE__ */ new Set([type]) : /* @__PURE__ */ new Set(),
      brands: brand ? /* @__PURE__ */ new Set([brand]) : /* @__PURE__ */ new Set()
    }));
  }, [params]);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [category, offersOnly]);
  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (offersOnly && !(p.old && p.old > p.price)) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.type.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [products, category, offersOnly, query]);
  const facets = useMemo(() => {
    const count = (map, key) => map.set(key, (map.get(key) || 0) + 1);
    const types = /* @__PURE__ */ new Map();
    const brands = /* @__PURE__ */ new Map();
    const skins = /* @__PURE__ */ new Map();
    let priceMax = 0;
    for (const p of pool) {
      count(types, p.type);
      count(brands, p.brand || "Make Me Pretty");
      for (const t of skinTokens(p.skin)) count(skins, t);
      priceMax = Math.max(priceMax, p.price);
    }
    const toList = (m) => [...m.entries()].map(([v, c]) => ({ v, count: c })).sort((a, b) => a.v.localeCompare(b.v));
    return { types: toList(types), brands: toList(brands), skins: toList(skins), priceMax };
  }, [pool]);
  const list = useMemo(() => {
    let l = pool.filter((p) => {
      if (filters.inStock && !filters.outStock && p.stock <= 0) return false;
      if (filters.outStock && !filters.inStock && p.stock > 0) return false;
      const min = Number(filters.priceMin);
      const max = Number(filters.priceMax);
      if (filters.priceMin !== "" && p.price < min) return false;
      if (filters.priceMax !== "" && p.price > max) return false;
      if (filters.types.size && !filters.types.has(p.type)) return false;
      if (filters.brands.size && !filters.brands.has(p.brand || "Make Me Pretty")) return false;
      if (filters.skins.size) {
        const tokens = skinTokens(p.skin);
        const isUniversal = tokens.some((t) => /^all/i.test(t));
        if (!isUniversal && !tokens.some((t) => filters.skins.has(t))) return false;
      }
      return true;
    });
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rated") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [pool, filters, sort]);
  const setF = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const toggleIn = (key, value) => setFilters((f) => {
    const next = new Set(f[key]);
    next.has(value) ? next.delete(value) : next.add(value);
    return { ...f, [key]: next };
  });
  const reset = () => setFilters({ ...EMPTY_FILTERS, types: /* @__PURE__ */ new Set(), brands: /* @__PURE__ */ new Set(), skins: /* @__PURE__ */ new Set() });
  const activeCount = (filters.inStock ? 1 : 0) + (filters.outStock ? 1 : 0) + (filters.priceMin !== "" ? 1 : 0) + (filters.priceMax !== "" ? 1 : 0) + filters.types.size + filters.brands.size + filters.skins.size;
  const brandParam = params.get("brand");
  const heading = offersOnly ? "On Offer" : brandParam ? brandParam : category === "All" ? "The Collection" : category;
  const segments = useMemo(() => {
    const strips = [...inlineStrips].sort((a, b) => a.afterRow - b.afterRow);
    const segs = [];
    let cursor = 0;
    for (const s of strips) {
      const pos = Math.min(s.afterRow * GRID_COLS, list.length);
      if (pos > cursor || segs.length === 0) {
        segs.push({ products: list.slice(cursor, pos), strip: s });
        cursor = pos;
      } else {
        segs.push({ products: [], strip: s });
      }
    }
    segs.push({ products: list.slice(cursor), strip: null });
    return segs;
  }, [list, inlineStrips]);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1280px] px-4 py-10 sm:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-7 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[clamp(30px,4.5vw,42px)] font-normal", children: heading }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1.5 text-[14px] text-ink-soft", children: [
        offersOnly ? "Limited-time prices across the range." : "Gentle, climate-conscious formulas \u2014 zero filler.",
        query && /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          "\xB7 results for \u201C",
          /* @__PURE__ */ jsx("span", { className: "text-ink", children: query }),
          "\u201D"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { ref: filtersRef, className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setFiltersOpen((o) => !o),
            "aria-expanded": filtersOpen,
            className: cx(
              "flex items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 text-[13px] font-medium transition-colors",
              filtersOpen || activeCount > 0 ? "border-rose bg-pink-soft text-rose" : "border-line text-ink hover:border-rose"
            ),
            children: [
              /* @__PURE__ */ jsx("svg", { viewBox: "0 0 20 20", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "1.6", children: /* @__PURE__ */ jsx("path", { d: "M3 5h14M6 10h8M9 15h2", strokeLinecap: "round" }) }),
              "Filters",
              activeCount > 0 && /* @__PURE__ */ jsx("span", { className: "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose px-1 text-[11px] font-semibold text-white", children: activeCount }),
              /* @__PURE__ */ jsx("span", { className: cx("text-[10px] transition-transform", filtersOpen && "rotate-180"), children: "\u25BE" })
            ]
          }
        ),
        filtersOpen && /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-[320px] max-w-[92vw] overflow-y-auto rounded-card shadow-menu animate-fadeup", children: /* @__PURE__ */ jsx(
          FilterPanel,
          {
            facets,
            filters,
            set: setF,
            toggleIn,
            onReset: reset,
            activeCount
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("p", { className: "hidden text-[13px] text-ink-soft sm:block", children: loading ? "Loading\u2026" : `${list.length} product${list.length === 1 ? "" : "s"}` }),
        /* @__PURE__ */ jsx("label", { className: "hidden text-[12px] uppercase tracking-[0.1em] text-ink-soft md:block", children: "Sort by" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: sort,
            onChange: (e) => setSort(e.target.value),
            "aria-label": "Sort products",
            className: "!w-auto !rounded-full !py-2.5 !pl-4 !pr-9 !text-[13px]",
            children: SORTS.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx(ProductCardSkeleton, {}, i)) }) : list.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "Nothing blooms here yet",
        message: "Try different filters or browse the full collection.",
        children: /* @__PURE__ */ jsx(Button, { size: "sm", onClick: reset, children: "Clear filters" })
      }
    ) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: segments.map((seg, si) => /* @__PURE__ */ jsxs("div", { children: [
      seg.products.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4", children: seg.products.map((p, j) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "animate-fadeup",
          style: { animationDelay: `${Math.min(j, 8) * 0.05}s` },
          children: /* @__PURE__ */ jsx(ProductCard, { product: p })
        },
        p.id
      )) }),
      seg.strip && /* @__PURE__ */ jsx(InlineMediaStrip, { strip: seg.strip })
    ] }, si)) })
  ] });
}
export {
  ShopClient as default
};
