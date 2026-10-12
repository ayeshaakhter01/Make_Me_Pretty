import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/ui/Link.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function SearchBar({ compact = false, onNavigate }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const blurTimer = useRef(null);
  useEffect(() => {
    let active = true;
    apiFetch("/api/products", { cache: "no-store" }).then((r) => r.json()).then((d) => active && setProducts(d.products || [])).catch(() => {
    });
    return () => {
      active = false;
    };
  }, []);
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.type.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [q, products]);
  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    onNavigate?.();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "relative w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "search-glow-wrap", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose", children: "\u2315" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          value: q,
          onChange: (e) => {
            setQ(e.target.value);
            setOpen(true);
          },
          onFocus: () => setOpen(true),
          onBlur: () => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          },
          placeholder: "Search products\u2026",
          "aria-label": "Search products",
          className: cx("search-glow !pl-10", compact ? "!py-2.5" : "!py-3")
        }
      )
    ] }) }),
    open && results.length > 0 && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-cream shadow-menu",
        onMouseDown: (e) => e.preventDefault(),
        children: [
          results.map((p) => /* @__PURE__ */ jsxs(
            Link,
            {
              href: `/product/${p.id}`,
              onClick: () => {
                clearTimeout(blurTimer.current);
                setOpen(false);
                setQ("");
                onNavigate?.();
              },
              className: "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-pink-soft",
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-line",
                    style: { background: `linear-gradient(160deg, ${p.c1}, #fff)` },
                    children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2, size: 0.24 })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: p.name }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.12em] text-ink-soft", children: p.type })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: bdt(p.price) })
              ]
            },
            p.id
          )),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              className: "w-full border-t border-line px-4 py-2.5 text-left text-[13px] font-medium text-rose transition-colors hover:bg-pink-soft",
              children: [
                "See all results for \u201C",
                q,
                "\u201D \u2192"
              ]
            }
          )
        ]
      }
    )
  ] });
}
export {
  SearchBar as default
};
