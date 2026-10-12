import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useRef, useState } from "react";
import { CATEGORIES, getTypesForCategory } from "@/data/categories.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import Button from "@/components/ui/Button.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
const SHAPES = ["pump", "jar", "dropper", "tube", "mist"];
const BADGES = ["", "Bestseller", "New"];
function ProductForm({ initial, defaultCategory, defaultType, onSaved, onClose }) {
  const isEdit = !!initial;
  const startCat = initial?.category || defaultCategory || CATEGORIES[0].name;
  const initOnOffer = !!(initial?.old && initial.old > initial.price);
  const initBase = initial?.old ?? initial?.price ?? "";
  const initPct = initOnOffer ? Math.round((initial.old - initial.price) / initial.old * 100) : "";
  const [f, setF] = useState({
    name: initial?.name || "",
    brand: initial?.brand || "",
    category: startCat,
    type: initial?.type || defaultType || getTypesForCategory(startCat)[0],
    basePrice: initBase === null ? "" : initBase,
    onOffer: initOnOffer,
    discount: initPct,
    stock: initial?.stock ?? "",
    badge: initial?.badge || "",
    shape: initial?.shape || "jar",
    skin: initial?.skin || "",
    desc: initial?.desc || "",
    ing: Array.isArray(initial?.ing) ? initial.ing.join(", ") : "",
    c1: initial?.c1 || "#F6DEE3",
    c2: initial?.c2 || "#DBA8B1"
  });
  const base = Number(f.basePrice) || 0;
  const pct = Number(f.discount) || 0;
  const onOfferValid = f.onOffer && pct > 0 && pct < 100;
  const salePrice = onOfferValid ? Math.round(base * (1 - pct / 100)) : base;
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState(initial?.media || []);
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef(null);
  const uploadMedia = async (files) => {
    if (!files?.length || !isEdit) return;
    setUploading(true);
    setErr("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("media", file);
      const res = await apiFetch(`/api/admin/products/${initial.id}/media`, {
        method: "POST",
        body: fd
      }).catch(() => null);
      const d = await res?.json().catch(() => ({}));
      if (!res?.ok) {
        setErr(d?.error || `Couldn\u2019t upload ${file.name}.`);
        break;
      }
      setMedia(d.all);
    }
    setUploading(false);
    if (mediaRef.current) mediaRef.current.value = "";
  };
  const deleteMedia = async (mediaId) => {
    const res = await apiFetch(
      `/api/admin/products/${initial.id}/media?mediaId=${mediaId}`,
      { method: "DELETE" }
    ).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (res?.ok) setMedia(d.all);
  };
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const onCategory = (category) => {
    const types = getTypesForCategory(category);
    setF((p) => ({
      ...p,
      category,
      type: types.includes(p.type) ? p.type : types[0]
    }));
  };
  const typeOptions = getTypesForCategory(f.category);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const payload = {
      name: f.name,
      brand: f.brand,
      category: f.category,
      type: f.type,
      price: salePrice,
      old: onOfferValid ? base : null,
      stock: Number(f.stock),
      badge: f.badge || null,
      shape: f.shape,
      skin: f.skin,
      desc: f.desc,
      ing: f.ing,
      c1: f.c1,
      c2: f.c2
    };
    try {
      const res = await apiFetch(
        isEdit ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Could not save the product.");
        setBusy(false);
        return;
      }
      onSaved(data.product);
    } catch {
      setErr("Network error. Please try again.");
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "grid gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-[15px] font-medium text-ink", children: "Products name :" }),
      /* @__PURE__ */ jsx("input", { value: f.name, onChange: (e) => set("name", e.target.value), placeholder: "Rose Dew Cleanser" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "Brand" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: f.brand,
          onChange: (e) => set("brand", e.target.value),
          placeholder: "Make Me Pretty"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-ink-soft", children: "Used by the footer brand-logo links (clicking a logo shows this brand\u2019s products)." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Main section" }),
        /* @__PURE__ */ jsx("select", { value: f.category, onChange: (e) => onCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { children: c.name }, c.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Sub-section (type)" }),
        /* @__PURE__ */ jsx("select", { value: f.type, onChange: (e) => set("type", e.target.value), children: typeOptions.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Regular price (\u09F3)" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: f.basePrice, onChange: (e) => set("basePrice", e.target.value), placeholder: "850" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Stock" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: "0", value: f.stock, onChange: (e) => set("stock", e.target.value), placeholder: "30" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-line bg-ivory p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: "Put this product on offer" }),
          /* @__PURE__ */ jsx("div", { className: "text-[12px] text-ink-soft", children: "Shows a discount in the Offers section, with the old price struck through." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => set("onOffer", !f.onOffer),
            "aria-pressed": f.onOffer,
            "aria-label": "Toggle offer",
            className: cx(
              "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
              f.onOffer ? "bg-rose" : "bg-line"
            ),
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: cx(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                  f.onOffer ? "left-[22px]" : "left-0.5"
                )
              }
            )
          }
        )
      ] }),
      f.onOffer && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-end gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-32", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Discount %" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "99",
              value: f.discount,
              onChange: (e) => set("discount", e.target.value),
              placeholder: "20"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.1em] text-ink-soft", children: "Customer pays" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-0.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-rose", children: onOfferValid ? bdt(salePrice) : "\u2014" }),
            onOfferValid && /* @__PURE__ */ jsx("span", { className: "ml-2 text-ink-soft line-through", children: bdt(base) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Badge" }),
        /* @__PURE__ */ jsx("select", { value: f.badge, onChange: (e) => set("badge", e.target.value), children: BADGES.map((b) => /* @__PURE__ */ jsx("option", { value: b, children: b || "None" }, b)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Best for" }),
        /* @__PURE__ */ jsx("input", { value: f.skin, onChange: (e) => set("skin", e.target.value), placeholder: "All skin types" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "Description" }),
      /* @__PURE__ */ jsx("textarea", { rows: 2, value: f.desc, onChange: (e) => set("desc", e.target.value), placeholder: "Short marketing description\u2026" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "Key ingredients (comma-separated)" }),
      /* @__PURE__ */ jsx("input", { value: f.ing, onChange: (e) => set("ing", e.target.value), placeholder: "Rose Water, Glycerin, Panthenol" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[auto_1fr_1fr] items-end gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex h-16 w-16 items-center justify-center rounded-2xl border border-line",
          style: { background: `linear-gradient(160deg, ${f.c1}, #fff)` },
          children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: f.shape, c1: f.c1, c2: f.c2, size: 0.32 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Bottle shape" }),
        /* @__PURE__ */ jsx("select", { value: f.shape, onChange: (e) => set("shape", e.target.value), children: SHAPES.map((s) => /* @__PURE__ */ jsx("option", { children: s }, s)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Tint 1" }),
          /* @__PURE__ */ jsx("input", { type: "color", value: f.c1, onChange: (e) => set("c1", e.target.value), className: "!h-10 !p-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Tint 2" }),
          /* @__PURE__ */ jsx("input", { type: "color", value: f.c2, onChange: (e) => set("c2", e.target.value), className: "!h-10 !p-1" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-line bg-ivory p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: "Photos & videos" }),
        isEdit && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => mediaRef.current?.click(),
            disabled: uploading,
            className: "rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink/90 disabled:opacity-60",
            children: uploading ? "Uploading\u2026" : "\uFF0B Upload media"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mb-3 text-[12px] text-ink-soft", children: isEdit ? "The first photo becomes the product's thumbnail; everything shows in the product-page gallery. Images \u2264 4 MB, videos \u2264 25 MB." : "Save the product first \u2014 then reopen it to upload photos & videos." }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: mediaRef,
          type: "file",
          accept: "image/*,video/mp4,video/webm",
          multiple: true,
          className: "hidden",
          onChange: (e) => uploadMedia(e.target.files)
        }
      ),
      isEdit && media.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2.5", children: media.map((m) => /* @__PURE__ */ jsxs("div", { className: "group relative h-20 w-20 overflow-hidden rounded-xl border border-line", children: [
        m.type === "video" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("video", { src: m.src, muted: true, className: "h-full w-full object-cover" }),
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-ink/25 text-sm text-white", children: "\u25B6" })
        ] }) : /* @__PURE__ */ jsx("img", { src: m.src, alt: "", className: "h-full w-full object-cover" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => deleteMedia(m.id),
            "aria-label": "Remove media",
            className: "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[11px] text-ink-soft opacity-0 transition-opacity hover:text-lowstock-text group-hover:opacity-100",
            children: "\u2715"
          }
        )
      ] }, m.id)) })
    ] }),
    err && /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1 flex gap-3", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, className: "flex-1", children: busy ? "Saving\u2026" : isEdit ? "Save changes" : "Add product" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "rounded-full border-[1.5px] border-line px-6 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink",
          children: "Cancel"
        }
      )
    ] })
  ] });
}
export {
  ProductForm as default
};
