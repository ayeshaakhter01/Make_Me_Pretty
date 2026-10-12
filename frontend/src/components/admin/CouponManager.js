import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useRef, useState } from "react";
import Badge from "@/components/ui/Badge.js";
import { cx } from "@/lib/utils.js";
function CouponManager() {
  const [coupons, setCoupons] = useState(null);
  const [annOpen, setAnnOpen] = useState(true);
  const [cpnOpen, setCpnOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", title: "", text: "" });
  const [newImage, setNewImage] = useState(null);
  const [newPreview, setNewPreview] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const newFileRef = useRef(null);
  const [threshold, setThreshold] = useState(null);
  const load = () => {
    apiFetch("/api/admin/coupons", { cache: "no-store" }).then((r) => r.json()).then((d) => setCoupons(d.coupons || [])).catch(() => setCoupons([]));
    apiFetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()).then((d) => setThreshold(d.settings?.freeDeliveryThreshold ?? 2e3)).catch(() => {
    });
  };
  useEffect(() => {
    load();
  }, []);
  const announcement = coupons?.find((c) => c.kind === "announcement");
  const discountCoupons = coupons?.filter((c) => c.kind === "coupon") || [];
  const pickNewImage = (file) => {
    if (!file) return;
    setNewImage(file);
    setNewPreview(URL.createObjectURL(file));
  };
  const resetForm = () => {
    setForm({ code: "", type: "percent", value: "", title: "", text: "" });
    setNewImage(null);
    setNewPreview("");
    setErr("");
  };
  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await apiFetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not create the coupon.");
      setBusy(false);
      return;
    }
    if (newImage && data.coupon?.id) {
      const fd = new FormData();
      fd.append("image", newImage);
      await apiFetch(`/api/admin/coupons/${data.coupon.id}/image`, { method: "POST", body: fd }).catch(() => {
      });
    }
    setBusy(false);
    resetForm();
    setAdding(false);
    load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setAnnOpen((o) => !o),
          className: "flex w-full items-center justify-between px-6 py-5 text-left",
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: "Announcement" }),
              /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "The Free-Delivery banner shown first on the storefront & popup." })
            ] }),
            /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", annOpen && "rotate-90"), children: "\u25B8" })
          ]
        }
      ),
      annOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-line p-6", children: announcement ? /* @__PURE__ */ jsx(
        CouponBox,
        {
          coupon: announcement,
          isAnnouncement: true,
          threshold,
          onChanged: load
        }
      ) : /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-2xl" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setCpnOpen((o) => !o),
          className: "flex w-full items-center justify-between px-6 py-5 text-left",
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: "Discount coupons" }),
              /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: coupons === null ? "Loading\u2026" : `${discountCoupons.length} coupon${discountCoupons.length === 1 ? "" : "s"} \xB7 code discounts for checkout` })
            ] }),
            /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", cpnOpen && "rotate-90"), children: "\u25B8" })
          ]
        }
      ),
      cpnOpen && /* @__PURE__ */ jsxs("div", { className: "border-t border-line p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 flex justify-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setAdding((a) => !a);
              if (adding) resetForm();
            },
            className: "rounded-full bg-rose px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep",
            children: adding ? "Cancel" : "+ New coupon"
          }
        ) }),
        adding && /* @__PURE__ */ jsxs("form", { onSubmit: create, className: "mb-5 rounded-2xl border border-line bg-ivory p-4 sm:flex sm:gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:w-52", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => newFileRef.current?.click(),
                className: "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-cream transition-colors hover:border-rose",
                children: newPreview ? /* @__PURE__ */ jsx("img", { src: newPreview, alt: "preview", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: "\uFF0B Upload image" })
              }
            ),
            /* @__PURE__ */ jsx("input", { ref: newFileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => pickNewImage(e.target.files?.[0]) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid flex-1 gap-3 sm:mt-0 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Code" }),
              /* @__PURE__ */ jsx("input", { value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value.toUpperCase() }), placeholder: "SUMMER15" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Title" }),
              /* @__PURE__ */ jsx("input", { value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), placeholder: "Summer Sale" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Type" }),
              /* @__PURE__ */ jsxs("select", { value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value }), children: [
                /* @__PURE__ */ jsx("option", { value: "percent", children: "% off" }),
                /* @__PURE__ */ jsx("option", { value: "shipping", children: "Free delivery" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: form.type === "shipping" ? "Value" : "Percent (%)" }),
              /* @__PURE__ */ jsx("input", { type: "number", min: "0", max: "100", disabled: form.type === "shipping", value: form.type === "shipping" ? "" : form.value, onChange: (e) => setForm({ ...form, value: e.target.value }), placeholder: form.type === "shipping" ? "\u2014" : "15" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Description" }),
              /* @__PURE__ */ jsx("input", { value: form.text, onChange: (e) => setForm({ ...form, text: e.target.value }), placeholder: "15% off all products this summer" })
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text sm:col-span-2", children: err }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, className: "rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink/90 disabled:opacity-60 sm:col-span-2", children: busy ? "Creating\u2026" : "Create coupon" })
          ] })
        ] }),
        coupons === null ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-2xl" }) : discountCoupons.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No discount coupons yet \u2014 add one above." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: discountCoupons.map((c) => /* @__PURE__ */ jsx(CouponBox, { coupon: c, onChanged: load }, c.id)) })
      ] })
    ] })
  ] });
}
function CouponBox({ coupon, isAnnouncement = false, threshold, onChanged }) {
  const [draft, setDraft] = useState({
    code: coupon.code || "",
    title: coupon.title || "",
    text: coupon.text || "",
    type: coupon.type || "percent",
    value: coupon.value ?? "",
    active: coupon.active,
    featured: coupon.featured
  });
  const [thresholdDraft, setThresholdDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  useEffect(() => {
    if (isAnnouncement && threshold != null) setThresholdDraft(String(threshold));
  }, [isAnnouncement, threshold]);
  const save = async () => {
    setBusy(true);
    setMsg("");
    const body = isAnnouncement ? { title: draft.title, text: draft.text, active: draft.active } : {
      code: draft.code,
      title: draft.title,
      text: draft.text,
      type: draft.type,
      value: draft.value,
      active: draft.active,
      featured: draft.featured
    };
    await apiFetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).catch(() => {
    });
    if (isAnnouncement) {
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeDeliveryThreshold: Number(thresholdDraft) || 0 })
      }).catch(() => {
      });
    }
    setBusy(false);
    setMsg("Saved \u2713");
    setTimeout(() => setMsg(""), 2e3);
    onChanged?.();
  };
  const toggleActive = async () => {
    const next = !draft.active;
    set("active", next);
    await apiFetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next })
    }).catch(() => {
    });
    onChanged?.();
  };
  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("image", file);
    const res = await apiFetch(`/api/admin/coupons/${coupon.id}/image`, { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) setMsg(data.error || "Upload failed");
    else onChanged?.();
  };
  const removeImage = async () => {
    await apiFetch(`/api/admin/coupons/${coupon.id}/image`, { method: "DELETE" }).catch(() => {
    });
    onChanged?.();
  };
  const removeCoupon = async () => {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    await apiFetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" }).catch(() => {
    });
    onChanged?.();
  };
  return /* @__PURE__ */ jsxs("div", { className: cx("rounded-2xl border border-line bg-ivory p-4", isAnnouncement && "sm:flex sm:gap-4"), children: [
    /* @__PURE__ */ jsxs("div", { className: cx(isAnnouncement ? "sm:w-56" : ""), children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => fileRef.current?.click(),
          className: "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-cream transition-colors hover:border-rose",
          children: coupon.image ? /* @__PURE__ */ jsx("img", { src: coupon.image, alt: coupon.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: uploading ? "Uploading\u2026" : "\uFF0B Upload image" })
        }
      ),
      /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => upload(e.target.files?.[0]) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex justify-between text-[11px]", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => fileRef.current?.click(), className: "text-rose", children: coupon.image ? "Change" : "Upload" }),
        coupon.image && /* @__PURE__ */ jsx("button", { type: "button", onClick: removeImage, className: "text-ink-soft hover:text-lowstock-text", children: "Remove" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex-1 sm:mt-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
        isAnnouncement ? /* @__PURE__ */ jsx(Badge, { tone: "gold", children: "Announcement" }) : /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-semibold", children: coupon.code }),
        /* @__PURE__ */ jsx(Badge, { tone: draft.active ? "gold" : "neutral", children: draft.active ? "Active" : "Paused" })
      ] }),
      /* @__PURE__ */ jsx("label", { className: "field-label", children: "Title" }),
      /* @__PURE__ */ jsx("input", { value: draft.title, onChange: (e) => set("title", e.target.value) }),
      /* @__PURE__ */ jsx("label", { className: "field-label mt-2", children: "Text" }),
      /* @__PURE__ */ jsx("input", { value: draft.text, onChange: (e) => set("text", e.target.value) }),
      isAnnouncement && /* @__PURE__ */ jsxs("div", { className: "mt-2 max-w-[220px]", children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: "Free delivery threshold (\u09F3)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            value: thresholdDraft,
            onChange: (e) => setThresholdDraft(e.target.value),
            placeholder: "2000"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-ink-soft", children: "Orders at or above this get free delivery (updates cart & checkout)." })
      ] }),
      !isAnnouncement && /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Code" }),
          /* @__PURE__ */ jsx("input", { value: draft.code, onChange: (e) => set("code", e.target.value.toUpperCase()) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Type" }),
          /* @__PURE__ */ jsxs("select", { value: draft.type, onChange: (e) => set("type", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "percent", children: "% off" }),
            /* @__PURE__ */ jsx("option", { value: "shipping", children: "Ship" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "%" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: "0", max: "100", disabled: draft.type === "shipping", value: draft.type === "shipping" ? "" : draft.value, onChange: (e) => set("value", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: save, disabled: busy, className: "rounded-full bg-rose px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Saving\u2026" : "Save" }),
        /* @__PURE__ */ jsx("button", { onClick: toggleActive, className: cx("rounded-full border-[1.5px] px-4 py-1.5 text-[13px] transition-colors", draft.active ? "border-line text-ink-soft hover:border-lowstock-text hover:text-lowstock-text" : "border-rose text-rose"), children: draft.active ? "Pause" : "Activate" }),
        !isAnnouncement && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[12px] text-ink-soft", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "!w-auto", checked: draft.featured, onChange: (e) => set("featured", e.target.checked) }),
            "In popup"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: removeCoupon, "aria-label": "Delete", className: "ml-auto text-ink-soft transition-colors hover:text-lowstock-text", children: "\u2715" })
        ] }),
        msg && /* @__PURE__ */ jsx("span", { className: "text-[12px] text-gold", children: msg })
      ] })
    ] })
  ] });
}
export {
  CouponManager as default
};
