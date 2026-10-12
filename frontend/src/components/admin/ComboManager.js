import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useMemo, useState } from "react";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
const BLANK = { name: "", description: "", price: "", productIds: [], active: true };
function ComboManager({ products = [] }) {
  const [combos, setCombos] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const productById = useMemo(
    () => new Map(products.map((p) => [String(p.id), p])),
    [products]
  );
  const load = () => apiFetch("/api/admin/combos", { cache: "no-store" }).then((r) => r.json()).then((d) => setCombos(d.combos || [])).catch(() => setCombos([]));
  useEffect(() => {
    load();
  }, []);
  const openNew = () => {
    setForm(BLANK);
    setSearch("");
    setErr("");
    setEditing("new");
  };
  const openEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description || "",
      price: String(c.price),
      productIds: [...c.productIds],
      active: c.active
    });
    setSearch("");
    setErr("");
    setEditing(c.id);
  };
  const cancel = () => {
    setEditing(null);
    setErr("");
  };
  const toggleProduct = (id) => setForm((f) => {
    const has = f.productIds.includes(id);
    return {
      ...f,
      productIds: has ? f.productIds.filter((x) => x !== id) : [...f.productIds, id]
    };
  });
  const selectedTotal = form.productIds.reduce(
    (s, id) => s + (productById.get(String(id))?.price || 0),
    0
  );
  const save = async () => {
    setErr("");
    if (!form.name.trim()) return setErr("Combo name is required.");
    if (form.productIds.length < 2) return setErr("Pick at least 2 products.");
    if (!(Number(form.price) > 0)) return setErr("Set a combo price greater than 0.");
    setBusy(true);
    const isEdit = editing !== "new";
    const url = isEdit ? `/api/admin/combos/${editing}` : "/api/admin/combos";
    try {
      const res = await apiFetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          productIds: form.productIds,
          active: form.active
        })
      });
      const d = await res.json();
      if (!res.ok) setErr(d.error || "Couldn\u2019t save the combo.");
      else {
        await load();
        setEditing(null);
      }
    } finally {
      setBusy(false);
    }
  };
  const remove = async (c) => {
    if (!confirm(`Delete combo \u201C${c.name}\u201D?`)) return;
    await apiFetch(`/api/admin/combos/${c.id}`, { method: "DELETE" }).catch(() => {
    });
    load();
  };
  const toggleActive = async (c) => {
    await apiFetch(`/api/admin/combos/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active })
    }).catch(() => {
    });
    load();
  };
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  return /* @__PURE__ */ jsxs("div", { className: "mt-3 overflow-hidden rounded-card border border-line bg-cream", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: cx(
          "flex w-full items-center justify-between px-5 py-4 text-left transition-colors",
          open ? "bg-pink-soft" : "hover:bg-pink-soft/50"
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", open && "rotate-90"), children: "\u25B8" }),
          /* @__PURE__ */ jsx("span", { className: "font-serif text-lg", children: "Combos" }),
          /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: combos ? `${combos.length} combo${combos.length === 1 ? "" : "s"}` : "\u2026" })
        ] })
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "border-t border-line px-3 py-4 sm:px-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "Curated bundles sold at a set price. Active combos appear on the storefront\u2019s Combo page." }),
        editing !== "new" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: openNew,
            className: "shrink-0 rounded-full bg-rose px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep",
            children: "+ Add combo"
          }
        )
      ] }),
      editing && /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-card border border-line bg-cream p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-3 font-serif text-lg", children: editing === "new" ? "New combo" : "Edit combo" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3.5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Combo name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.name,
                onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                placeholder: "e.g. Glow Starter Set"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Combo price (\u09F3)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.price,
                onChange: (e) => setForm((f) => ({ ...f, price: e.target.value })),
                placeholder: "0",
                inputMode: "numeric"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Description (optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: form.description,
                onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                placeholder: "Short blurb shown on the combo card"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "field-label !mb-0", children: [
              "Products in this combo (",
              form.productIds.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[12px] text-ink-soft", children: [
              "Individual total: ",
              bdt(selectedTotal),
              Number(form.price) > 0 && selectedTotal > Number(form.price) && /* @__PURE__ */ jsxs("span", { className: "text-rose", children: [
                " \xB7 saves ",
                bdt(selectedTotal - Number(form.price))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search products\u2026",
              className: "mb-2"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-y-auto rounded-2xl border border-line", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-4 py-3 text-[13px] text-ink-soft", children: "No products match." }) : filtered.map((p) => {
            const checked = form.productIds.includes(String(p.id));
            return /* @__PURE__ */ jsxs(
              "label",
              {
                className: cx(
                  "flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2 last:border-0 transition-colors",
                  checked ? "bg-pink-soft" : "hover:bg-ivory-2"
                ),
                children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked,
                      onChange: () => toggleProduct(String(p.id)),
                      className: "!h-4 !w-4 accent-rose"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line",
                      style: { background: `linear-gradient(160deg, ${p.c1}, #fff)` },
                      children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: p.shape, c1: p.c1, c2: p.c2, size: 0.16 })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-sm", children: p.name }),
                  /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: bdt(p.price) })
                ]
              },
              p.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "mt-3 flex cursor-pointer items-center gap-2.5 text-sm", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: form.active,
              onChange: (e) => setForm((f) => ({ ...f, active: e.target.checked })),
              className: "!h-4 !w-4 accent-rose"
            }
          ),
          "Active (visible on the storefront)"
        ] }),
        err && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: save,
              disabled: busy,
              className: "rounded-full bg-rose px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60",
              children: busy ? "Saving\u2026" : editing === "new" ? "Create combo" : "Save changes"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: cancel,
              className: "rounded-full border-[1.5px] border-line px-5 py-2 text-[13px] transition-colors hover:border-rose",
              children: "Cancel"
            }
          )
        ] })
      ] }),
      combos === null ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-card" }) : combos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rounded-card border border-line bg-cream px-5 py-4 text-[13px] text-ink-soft", children: "No combos yet. Create one to feature a bundle on the storefront." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: combos.map((c) => {
        const items = c.productIds.map((id) => productById.get(String(id))).filter(Boolean);
        const originalTotal = items.reduce((s, p) => s + p.price, 0);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex flex-wrap items-center gap-3 rounded-card border border-line bg-cream p-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-serif text-base", children: c.name }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cx(
                        "rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
                        c.active ? "bg-pink-soft text-rose" : "bg-ivory-2 text-ink-soft"
                      ),
                      children: c.active ? "Active" : "Hidden"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-0.5 truncate text-[12.5px] text-ink-soft", children: items.map((p) => p.name).join(" + ") || "No products" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right text-sm", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: bdt(c.price) }),
                originalTotal > c.price && /* @__PURE__ */ jsx("div", { className: "text-[11px] text-ink-soft line-through", children: bdt(originalTotal) })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => toggleActive(c),
                  className: "rounded-full border-[1.5px] border-line px-3 py-1.5 text-[12px] transition-colors hover:border-rose hover:text-rose",
                  children: c.active ? "Hide" : "Show"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEdit(c),
                  className: "rounded-full border-[1.5px] border-line px-3 py-1.5 text-[12px] transition-colors hover:border-rose hover:text-rose",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => remove(c),
                  "aria-label": `Delete ${c.name}`,
                  className: "text-ink-soft transition-colors hover:text-lowstock-text",
                  children: "\u2715"
                }
              )
            ]
          },
          c.id
        );
      }) })
    ] })
  ] });
}
export {
  ComboManager as default
};
