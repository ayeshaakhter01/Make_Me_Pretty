import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useMemo, useState } from "react";
import { CATEGORIES, getTypesForCategory } from "@/data/categories.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import Badge from "@/components/ui/Badge.js";
import Modal from "@/components/ui/Modal.js";
import ProductForm from "@/components/admin/ProductForm.js";
import ComboManager from "@/components/admin/ComboManager.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function InventoryManager({ products = [], onRefresh }) {
  const [openSections, setOpenSections] = useState(() => /* @__PURE__ */ new Set([CATEGORIES[0].name]));
  const [openTypes, setOpenTypes] = useState(() => /* @__PURE__ */ new Set());
  const [modal, setModal] = useState(null);
  const toggle = (setFn, key) => setFn((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const grouped = useMemo(() => {
    const g = {};
    for (const cat of CATEGORIES) {
      g[cat.name] = {};
      for (const t of cat.types) g[cat.name][t] = [];
    }
    for (const p of products) {
      if (g[p.category] && g[p.category][p.type]) g[p.category][p.type].push(p);
    }
    return g;
  }, [products]);
  const sectionStats = (catName) => {
    const items = products.filter((p) => p.category === catName);
    const low = items.filter((p) => p.stock <= 5).length;
    return { count: items.length, low };
  };
  const closeModal = () => setModal(null);
  const onSaved = () => {
    closeModal();
    onRefresh?.();
  };
  const deleteProduct = async (p) => {
    if (!confirm(`Delete \u201C${p.name}\u201D? This cannot be undone.`)) return;
    await apiFetch(`/api/admin/products/${p.id}`, { method: "DELETE" }).catch(() => {
    });
    onRefresh?.();
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-[13px] text-ink-soft", children: [
        products.length,
        " products across ",
        CATEGORIES.length,
        " sections"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setModal({ mode: "add" }),
          className: "rounded-full bg-rose px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep",
          children: "+ Add product"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: CATEGORIES.map((cat) => {
      const sOpen = openSections.has(cat.name);
      const { count, low } = sectionStats(cat.name);
      return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-card border border-line bg-cream", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => toggle(setOpenSections, cat.name),
            className: cx(
              "flex w-full items-center justify-between px-5 py-4 text-left transition-colors",
              sOpen ? "bg-pink-soft" : "hover:bg-pink-soft/50"
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", sOpen && "rotate-90"), children: "\u25B8" }),
                /* @__PURE__ */ jsx("span", { className: "font-serif text-lg", children: cat.name }),
                /* @__PURE__ */ jsxs("span", { className: "text-[12px] text-ink-soft", children: [
                  count,
                  " product",
                  count === 1 ? "" : "s"
                ] })
              ] }),
              low > 0 && /* @__PURE__ */ jsxs(Badge, { tone: "low", children: [
                low,
                " low stock"
              ] })
            ]
          }
        ),
        sOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-line px-3 py-3", children: getTypesForCategory(cat.name).map((type) => {
          const key = `${cat.name}::${type}`;
          const tOpen = openTypes.has(key);
          const items = grouped[cat.name][type];
          return /* @__PURE__ */ jsxs("div", { className: "mb-2 overflow-hidden rounded-2xl border border-line bg-ivory last:mb-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => toggle(setOpenTypes, key),
                className: "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-pink-soft/40",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsx("span", { className: cx("text-[11px] text-rose transition-transform", tOpen && "rotate-90"), children: "\u25B8" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: type }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-ink-soft", children: [
                      "(",
                      items.length,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      role: "button",
                      tabIndex: 0,
                      onClick: (e) => {
                        e.stopPropagation();
                        setModal({ mode: "add", category: cat.name, type });
                      },
                      className: "rounded-full px-2.5 py-1 text-[11px] text-rose transition-colors hover:bg-pink",
                      children: "+ Add here"
                    }
                  )
                ]
              }
            ),
            tOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-line", children: items.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-[12.5px] text-ink-soft", children: "No products in this sub-section yet." }) : items.map((p) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0",
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-line",
                      style: { background: `linear-gradient(160deg, ${p.c1}, #fff)` },
                      children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2, size: 0.2 })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: p.name }),
                    /* @__PURE__ */ jsx("div", { className: "text-[12px] text-ink-soft", children: bdt(p.price) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right text-[12.5px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-ink-soft", children: "Stock" }),
                    /* @__PURE__ */ jsx("div", { className: "font-semibold", children: p.stock })
                  ] }),
                  p.stock <= 5 ? /* @__PURE__ */ jsx(Badge, { tone: "low", children: "Restock" }) : /* @__PURE__ */ jsx(Badge, { tone: "gold", children: "Healthy" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setModal({ mode: "edit", product: p }),
                      className: "rounded-full border-[1.5px] border-line px-3 py-1.5 text-[12px] transition-colors hover:border-rose hover:text-rose",
                      children: "Edit"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => deleteProduct(p),
                      "aria-label": `Delete ${p.name}`,
                      className: "text-ink-soft transition-colors hover:text-lowstock-text",
                      children: "\u2715"
                    }
                  )
                ]
              },
              p.id
            )) })
          ] }, type);
        }) })
      ] }, cat.name);
    }) }),
    /* @__PURE__ */ jsx(ComboManager, { products }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: !!modal,
        onClose: closeModal,
        title: modal?.mode === "edit" ? "Edit product" : "Add product",
        children: modal && /* @__PURE__ */ jsx(
          ProductForm,
          {
            initial: modal.product || null,
            defaultCategory: modal.category,
            defaultType: modal.type,
            onSaved,
            onClose: closeModal
          }
        )
      }
    )
  ] });
}
export {
  InventoryManager as default
};
