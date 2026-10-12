import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useRef, useState } from "react";
import Badge from "@/components/ui/Badge.js";
import { cx } from "@/lib/utils.js";
import { SOCIAL_PLATFORMS, SOCIAL_LABELS } from "@/data/footer.js";
function BannersManager() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(BrandSection, {}),
    /* @__PURE__ */ jsx(HeroSlidesSection, {}),
    /* @__PURE__ */ jsx(PageBannersSection, {}),
    /* @__PURE__ */ jsx(InlineMediaSection, {}),
    /* @__PURE__ */ jsx(BrandLogosSection, {}),
    /* @__PURE__ */ jsx(ContentPagesSection, {}),
    /* @__PURE__ */ jsx(SocialSection, {}),
    /* @__PURE__ */ jsx(PaymentLogosSection, {})
  ] });
}
function Section({ title, sub, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-line bg-cream", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "flex w-full items-center justify-between px-6 py-5 text-left",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg", children: title }),
            /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: sub })
          ] }),
          /* @__PURE__ */ jsx("span", { className: cx("text-rose transition-transform", open && "rotate-90"), children: "\u25B8" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "border-t border-line p-6", children })
  ] });
}
function MediaThumb({ src, type, className }) {
  if (!src)
    return /* @__PURE__ */ jsx("div", { className: cx("flex items-center justify-center bg-ivory-2 text-xs text-ink-soft", className), children: "\u2014" });
  return type === "video" ? /* @__PURE__ */ jsx("video", { src, muted: true, loop: true, autoPlay: true, playsInline: true, className: cx("object-cover", className) }) : /* @__PURE__ */ jsx("img", { src, alt: "", className: cx("object-cover", className) });
}
function UploadBox({ onPick, preview, previewType, label = "\uFF0B Upload image / video", className }) {
  const ref = useRef(null);
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => ref.current?.click(),
        className: "relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-ivory transition-colors hover:border-rose",
        children: preview ? /* @__PURE__ */ jsx(MediaThumb, { src: preview, type: previewType, className: "h-full w-full" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: label })
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref,
        type: "file",
        accept: "image/*,video/mp4,video/webm",
        className: "hidden",
        onChange: (e) => onPick(e.target.files?.[0])
      }
    )
  ] });
}
function BrandSection() {
  const [b, setB] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const load = () => apiFetch("/api/admin/branding", { cache: "no-store" }).then((r) => r.json()).then((d) => setB(d.branding)).catch(() => {
  });
  useEffect(() => {
    load();
  }, []);
  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };
  const save = async () => {
    setBusy(true);
    await apiFetch("/api/admin/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: b.name, tagline: b.tagline, story: b.story })
    }).catch(() => {
    });
    setBusy(false);
    flash("Saved \u2713 \u2014 live across the site");
  };
  const uploadLogo = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    setBusy(true);
    const res = await apiFetch("/api/admin/branding", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return flash(d.error || "Upload failed");
    setB(d.branding);
    flash("Logo updated \u2713");
  };
  const removeLogo = async () => {
    setBusy(true);
    const res = await apiFetch("/api/admin/branding", { method: "DELETE" });
    const d = await res.json();
    setBusy(false);
    setB(d.branding);
    flash("Logo removed \u2014 text wordmark shown");
  };
  if (!b) return /* @__PURE__ */ jsx("div", { className: "h-28 skel rounded-card" });
  return /* @__PURE__ */ jsx(
    Section,
    {
      title: "Logo & Brand",
      sub: "Site logo (navbar, admin, invoice, email) + tagline & brand story.",
      defaultOpen: true,
      children: /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-[220px_1fr]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => fileRef.current?.click(),
              className: "flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-ivory p-3 transition-colors hover:border-rose",
              children: b.logo ? /* @__PURE__ */ jsx("img", { src: b.logo, alt: "logo", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: "\uFF0B Upload logo" })
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "image/*",
              className: "hidden",
              onChange: (e) => uploadLogo(e.target.files?.[0])
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex justify-between text-[11px]", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => fileRef.current?.click(), className: "text-rose", children: b.logo ? "Change" : "Upload" }),
            b.logo && /* @__PURE__ */ jsx("button", { onClick: removeLogo, className: "text-ink-soft hover:text-lowstock-text", children: "Remove" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Brand name" }),
              /* @__PURE__ */ jsx("input", { value: b.name, onChange: (e) => setB({ ...b, name: e.target.value }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Tagline" }),
              /* @__PURE__ */ jsx("input", { value: b.tagline, onChange: (e) => setB({ ...b, tagline: e.target.value }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Brand story" }),
            /* @__PURE__ */ jsx("textarea", { rows: 3, value: b.story, onChange: (e) => setB({ ...b, story: e.target.value }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: save,
                disabled: busy,
                className: "rounded-full bg-rose px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60",
                children: busy ? "Working\u2026" : "Save brand"
              }
            ),
            msg && /* @__PURE__ */ jsx("span", { className: "text-[12.5px] text-gold", children: msg })
          ] })
        ] })
      ] })
    }
  );
}
function HeroSlidesSection() {
  const [slides, setSlides] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [form, setForm] = useState({ title: "", subtitle: "", href: "/shop", isOffer: false });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => apiFetch("/api/admin/hero-slides", { cache: "no-store" }).then((r) => r.json()).then((d) => setSlides(d.slides || [])).catch(() => setSlides([]));
  useEffect(() => {
    load();
  }, []);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreviewType(f.type.startsWith("video") ? "video" : "image");
  };
  const add = async (e) => {
    e.preventDefault();
    if (!file) return setErr("Choose an image or video first.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("media", file);
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("href", form.href);
    fd.append("isOffer", String(form.isOffer));
    const res = await apiFetch("/api/admin/hero-slides", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Upload failed.");
    setFile(null);
    setPreview("");
    setForm({ title: "", subtitle: "", href: "/shop", isOffer: false });
    load();
  };
  const patch = (id, body) => apiFetch(`/api/admin/hero-slides/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(load);
  const move = (i, dir) => {
    const list = [...slides];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    Promise.all([
      patch(list[i].id, { order: j + 1 }),
      patch(list[j].id, { order: i + 1 })
    ]);
  };
  const del = (id) => {
    if (!confirm("Delete this slide?")) return;
    apiFetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" }).then(load);
  };
  return /* @__PURE__ */ jsxs(
    Section,
    {
      title: "Homepage hero slides",
      sub: "The 3D coverflow carousel at the top of the homepage. Images or videos.",
      children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "mb-5 grid gap-3 rounded-2xl border border-line bg-ivory p-4 sm:grid-cols-[240px_1fr]", children: [
          /* @__PURE__ */ jsx(UploadBox, { onPick: pick, preview, previewType }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2.5 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "field-label", children: "Title (optional)" }),
                /* @__PURE__ */ jsx("input", { value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), placeholder: "Monsoon Glow Sale" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "field-label", children: "Subtitle (optional)" }),
                /* @__PURE__ */ jsx("input", { value: form.subtitle, onChange: (e) => setForm({ ...form, subtitle: e.target.value }), placeholder: "20% off all serums" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid items-end gap-2.5 sm:grid-cols-[1fr_auto_auto]", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "field-label", children: "Link" }),
                /* @__PURE__ */ jsx("input", { value: form.href, onChange: (e) => setForm({ ...form, href: e.target.value }), placeholder: "/shop", disabled: form.isOffer })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 pb-2.5 text-[12.5px] text-ink-soft", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", className: "!w-auto", checked: form.isOffer, onChange: (e) => setForm({ ...form, isOffer: e.target.checked }) }),
                "Offer banner (links to Offers)"
              ] }),
              /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, className: "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Uploading\u2026" : "+ Add slide" })
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err })
          ] })
        ] }),
        slides === null ? /* @__PURE__ */ jsx("div", { className: "h-20 skel rounded-2xl" }) : slides.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No slides yet \u2014 the homepage shows the branded fallback panel." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: slides.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsx(MediaThumb, { src: s.media, type: s.mediaType, className: "h-16 w-28 flex-shrink-0 rounded-lg" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: s.title || /* @__PURE__ */ jsx("span", { className: "text-ink-soft", children: "Untitled slide" }) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-soft", children: [
              /* @__PURE__ */ jsx(Badge, { tone: s.active ? "gold" : "neutral", children: s.active ? "Live" : "Hidden" }),
              s.isOffer && /* @__PURE__ */ jsx(Badge, { tone: "pink", children: "Offer \u2192 /offers" }),
              /* @__PURE__ */ jsx("span", { children: s.mediaType })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => move(i, -1), disabled: i === 0, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2191" }),
            /* @__PURE__ */ jsx("button", { onClick: () => move(i, 1), disabled: i === slides.length - 1, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2193" }),
            /* @__PURE__ */ jsx("button", { onClick: () => patch(s.id, { active: !s.active }), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", s.active ? "border-line text-ink-soft" : "border-rose text-rose"), children: s.active ? "Hide" : "Show" }),
            /* @__PURE__ */ jsx("button", { onClick: () => del(s.id), className: "ml-1 text-ink-soft hover:text-lowstock-text", children: "\u2715" })
          ] })
        ] }, s.id)) })
      ]
    }
  );
}
function PageBannersSection() {
  const [pages, setPages] = useState([]);
  const [banners, setBanners] = useState({});
  const [page, setPage] = useState("Skincare");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [href, setHref] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => apiFetch("/api/admin/page-banners", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    setPages(d.pages || []);
    setBanners(d.banners || {});
  }).catch(() => {
  });
  useEffect(() => {
    load();
  }, []);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreviewType(f.type.startsWith("video") ? "video" : "image");
  };
  const add = async (e) => {
    e.preventDefault();
    if (!file) return setErr("Choose an image or video first.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("media", file);
    fd.append("page", page);
    fd.append("href", href);
    const res = await apiFetch("/api/admin/page-banners", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Upload failed.");
    setFile(null);
    setPreview("");
    setHref("");
    load();
  };
  const list = banners[page] || [];
  return /* @__PURE__ */ jsxs(
    Section,
    {
      title: "Page banners",
      sub: "A top banner slot for each main page \u2014 Skincare, Body Care, Hair Care, Makeup, Offers.",
      children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: pages.map((p) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setPage(p),
            className: cx(
              "rounded-full border-[1.5px] px-4 py-1.5 text-[13px] transition-colors",
              page === p ? "border-ink bg-ink text-ivory" : "border-line bg-ivory text-ink-soft hover:border-rose"
            ),
            children: [
              p,
              " (",
              (banners[p] || []).length,
              ")"
            ]
          },
          p
        )) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "mb-4 grid gap-3 rounded-2xl border border-line bg-ivory p-4 sm:grid-cols-[240px_1fr]", children: [
          /* @__PURE__ */ jsx(UploadBox, { onPick: pick, preview, previewType }),
          /* @__PURE__ */ jsxs("div", { className: "grid content-start gap-2.5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Link (optional)" }),
              /* @__PURE__ */ jsx("input", { value: href, onChange: (e) => setHref(e.target.value), placeholder: "/shop?offers=1" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, className: "w-max rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Uploading\u2026" : `+ Add to ${page}` }),
            err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err })
          ] })
        ] }),
        list.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-ink-soft", children: [
          "No banner on ",
          page,
          " yet."
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-2.5 sm:grid-cols-2", children: list.map((b) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsx(MediaThumb, { src: b.media, type: b.mediaType, className: "h-14 w-24 flex-shrink-0 rounded-lg" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 text-[12px] text-ink-soft", children: [
            /* @__PURE__ */ jsx(Badge, { tone: b.active ? "gold" : "neutral", children: b.active ? "Live" : "Hidden" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 truncate", children: b.href || "no link" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => apiFetch(`/api/admin/page-banners/${b.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !b.active })
              }).then(load),
              className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", b.active ? "border-line text-ink-soft" : "border-rose text-rose"),
              children: b.active ? "Hide" : "Show"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                if (confirm("Delete this banner?"))
                  apiFetch(`/api/admin/page-banners/${b.id}`, { method: "DELETE" }).then(load);
              },
              className: "text-ink-soft hover:text-lowstock-text",
              children: "\u2715"
            }
          )
        ] }, b.id)) })
      ]
    }
  );
}
function InlineMediaSection() {
  const [items, setItems] = useState(null);
  const [pages, setPages] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [sel, setSel] = useState("all");
  const [afterRow, setAfterRow] = useState(2);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => apiFetch("/api/admin/inline-media", { cache: "no-store" }).then((r) => r.json()).then((d) => {
    setItems(d.media || []);
    setPages(d.pages || []);
  }).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreviewType(f.type.startsWith("video") ? "video" : "image");
  };
  const togglePage = (p) => {
    if (sel === "all") setSel([p]);
    else if (sel.includes(p)) setSel(sel.filter((x) => x !== p));
    else setSel([...sel, p]);
  };
  const add = async (e) => {
    e.preventDefault();
    if (!file) return setErr("Choose an image or video first.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("media", file);
    fd.append("pages", sel === "all" ? "all" : JSON.stringify(sel));
    fd.append("afterRow", String(afterRow));
    const res = await apiFetch("/api/admin/inline-media", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Upload failed.");
    setFile(null);
    setPreview("");
    setSel("all");
    load();
  };
  return /* @__PURE__ */ jsxs(
    Section,
    {
      title: "Between-product media",
      sub: "Editorial image/video strips that reveal on scroll between product rows.",
      children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "mb-4 grid gap-3 rounded-2xl border border-line bg-ivory p-4 sm:grid-cols-[240px_1fr]", children: [
          /* @__PURE__ */ jsx(UploadBox, { onPick: pick, preview, previewType }),
          /* @__PURE__ */ jsxs("div", { className: "grid content-start gap-2.5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Show on pages" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSel("all"), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", sel === "all" ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft"), children: "All pages" }),
                pages.map((p) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => togglePage(p), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", sel !== "all" && sel.includes(p) ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft"), children: p }, p))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-32", children: [
                /* @__PURE__ */ jsx("label", { className: "field-label", children: "After row #" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: "1", value: afterRow, onChange: (e) => setAfterRow(e.target.value) })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, className: "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Uploading\u2026" : "+ Add strip" })
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err })
          ] })
        ] }),
        items === null ? /* @__PURE__ */ jsx("div", { className: "h-16 skel rounded-2xl" }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No strips yet." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-2.5 sm:grid-cols-2", children: items.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsx(MediaThumb, { src: m.media, type: m.mediaType, className: "h-14 w-24 flex-shrink-0 rounded-lg" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 text-[12px] text-ink-soft", children: [
            /* @__PURE__ */ jsx(Badge, { tone: m.active ? "gold" : "neutral", children: m.active ? "Live" : "Hidden" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 truncate", children: [
              m.pages === "all" ? "All pages" : (m.pages || []).join(", "),
              " \xB7 after row ",
              m.afterRow
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => apiFetch(`/api/admin/inline-media/${m.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !m.active })
              }).then(load),
              className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", m.active ? "border-line text-ink-soft" : "border-rose text-rose"),
              children: m.active ? "Hide" : "Show"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                if (confirm("Delete this strip?"))
                  apiFetch(`/api/admin/inline-media/${m.id}`, { method: "DELETE" }).then(load);
              },
              className: "text-ink-soft hover:text-lowstock-text",
              children: "\u2715"
            }
          )
        ] }, m.id)) })
      ]
    }
  );
}
function ContentPagesSection() {
  const [pages, setPages] = useState(null);
  const [savingSlug, setSavingSlug] = useState(null);
  const load = () => apiFetch("/api/admin/content-pages", { cache: "no-store" }).then((r) => r.json()).then((d) => setPages(d.pages || [])).catch(() => setPages([]));
  useEffect(() => {
    load();
  }, []);
  const setField = (slug, key, value) => setPages((ps) => ps.map((p) => p.slug === slug ? { ...p, [key]: value } : p));
  const save = async (p) => {
    setSavingSlug(p.slug);
    await apiFetch(`/api/admin/content-pages/${p.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: p.title, body: p.body })
    }).catch(() => {
    });
    setSavingSlug(null);
  };
  return /* @__PURE__ */ jsx(
    Section,
    {
      title: "Footer \xB7 Help & Policy pages",
      sub: "The pages behind the Help and Customer Policy footer links. Edit each page's title and text.",
      children: pages === null ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-2xl" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: pages.map((p) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-line bg-ivory p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: p.title,
              onChange: (e) => setField(p.slug, "title", e.target.value),
              className: "!py-2 font-medium"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-[11px] text-ink-soft", children: [
            "/p/",
            p.slug
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 4,
            value: p.body,
            onChange: (e) => setField(p.slug, "body", e.target.value),
            placeholder: "Page text\u2026 (blank shows a \u201Ccoming soon\u201D note on the page)"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex justify-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => save(p),
            disabled: savingSlug === p.slug,
            className: "rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink/90 disabled:opacity-60",
            children: savingSlug === p.slug ? "Saving\u2026" : "Save page"
          }
        ) }),
        p.slug === "about-us" && /* @__PURE__ */ jsx(AboutPeopleManager, {})
      ] }, p.slug)) })
    }
  );
}
function AboutPeopleManager() {
  const [people, setPeople] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [form, setForm] = useState({ name: "", text: "" });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const load = () => apiFetch("/api/admin/about", { cache: "no-store" }).then((r) => r.json()).then((d) => setPeople(d.people || [])).catch(() => setPeople([]));
  useEffect(() => {
    load();
  }, []);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreviewType(f.type.startsWith("video") ? "video" : "image");
  };
  const reset = () => {
    setForm({ name: "", text: "" });
    setFile(null);
    setPreview("");
    setEditing(null);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const submit = async () => {
    if (!form.name.trim()) return setErr("Name is required.");
    if (!editing && !file) return setErr("Add a photo or video.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("text", form.text);
    if (file) fd.append("media", file);
    const url = editing ? `/api/admin/about/${editing}` : "/api/admin/about";
    const res = await apiFetch(url, { method: editing ? "PATCH" : "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Save failed.");
    setPeople(d.people || []);
    reset();
  };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, text: p.text });
    setFile(null);
    setPreview(p.media);
    setPreviewType(p.mediaType);
    setErr("");
  };
  const patch = (id, body) => apiFetch(`/api/admin/about/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((r) => r.json()).then((d) => setPeople(d.people || []));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= people.length) return;
    Promise.all([
      patch(people[i].id, { order: j + 1 }),
      patch(people[j].id, { order: i + 1 })
    ]);
  };
  const del = (id) => {
    if (!confirm("Remove this person?")) return;
    apiFetch(`/api/admin/about/${id}`, { method: "DELETE" }).then((r) => r.json()).then((d) => setPeople(d.people || []));
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-dashed border-rose/40 bg-pink-soft/40 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-3 text-[12px] font-semibold uppercase tracking-wide text-rose", children: "About Us \u2014 people" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-xl border border-line bg-white p-3 sm:grid-cols-[150px_1fr]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => fileRef.current?.click(),
          className: "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-ivory transition-colors hover:border-rose",
          children: preview ? /* @__PURE__ */ jsx(MediaThumb, { src: preview, type: previewType, className: "h-full w-full" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: "\uFF0B Photo / video" })
        }
      ),
      /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/*,video/mp4,video/webm", className: "hidden", onChange: (e) => pick(e.target.files?.[0]) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2.5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Name" }),
          /* @__PURE__ */ jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "Ayesha Akhter" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Text" }),
          /* @__PURE__ */ jsx("textarea", { rows: 3, value: form.text, onChange: (e) => setForm({ ...form, text: e.target.value }), placeholder: "As the Founder of Make Me Pretty\u2026" })
        ] }),
        err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: submit, disabled: busy, className: "rounded-full bg-rose px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Saving\u2026" : editing ? "Save changes" : "+ Add person" }),
          editing && /* @__PURE__ */ jsx("button", { onClick: reset, className: "rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] transition-colors hover:border-rose", children: "Cancel" })
        ] })
      ] })
    ] }),
    people === null ? /* @__PURE__ */ jsx("div", { className: "mt-3 h-16 skel rounded-xl" }) : people.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-3 text-[13px] text-ink-soft", children: "No people yet." }) : /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: people.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-line bg-white p-2.5", children: [
      /* @__PURE__ */ jsx(MediaThumb, { src: p.media, type: p.mediaType, className: "h-12 w-12 flex-shrink-0 rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: p.name }),
        /* @__PURE__ */ jsx("div", { className: "truncate text-[12px] text-ink-soft", children: p.text })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => move(i, -1), disabled: i === 0, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2191" }),
      /* @__PURE__ */ jsx("button", { onClick: () => move(i, 1), disabled: i === people.length - 1, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2193" }),
      /* @__PURE__ */ jsx("button", { onClick: () => startEdit(p), className: "rounded-full border-[1.5px] border-line px-3 py-1 text-[12px] transition-colors hover:border-rose hover:text-rose", children: "Edit" }),
      /* @__PURE__ */ jsx("button", { onClick: () => del(p.id), className: "text-ink-soft hover:text-lowstock-text", children: "\u2715" })
    ] }, p.id)) })
  ] });
}
function SocialSection() {
  const [social, setSocial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newUrl, setNewUrl] = useState("");
  useEffect(() => {
    apiFetch("/api/admin/footer", { cache: "no-store" }).then((r) => r.json()).then((d) => setSocial(d.social || {})).catch(() => setSocial({}));
  }, []);
  const persist = async (next) => {
    setBusy(true);
    setSaved(false);
    const res = await apiFetch("/api/admin/footer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ social: next })
    }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) {
      setSocial(d.social || {});
      setSaved(true);
    }
  };
  const updateUrl = (key, url) => {
    setSaved(false);
    setSocial((s) => ({ ...s, [key]: url }));
  };
  const saveEntry = (key) => persist(social);
  const del = (key) => {
    const next = { ...social };
    delete next[key];
    persist(next);
  };
  const add = () => {
    if (!newKey || !newUrl.trim()) return;
    persist({ ...social, [newKey]: newUrl.trim() });
    setNewKey("");
    setNewUrl("");
  };
  const entries = social ? SOCIAL_PLATFORMS.filter((p) => social[p.key] !== void 0) : [];
  const available = social ? SOCIAL_PLATFORMS.filter((p) => social[p.key] === void 0) : [];
  return /* @__PURE__ */ jsx(
    Section,
    {
      title: "Footer \xB7 Social media",
      sub: "Add, edit or remove the icon links shown in the footer.",
      children: social === null ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-2xl" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        entries.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No social links yet \u2014 add one below." }),
        entries.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-[180px] flex-1", children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: p.label }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: social[p.key] || "",
                onChange: (e) => updateUrl(p.key, e.target.value),
                placeholder: `https://\u2026  (${p.label} URL)`
              }
            )
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => saveEntry(p.key), disabled: busy, className: "rounded-full bg-ink px-4 py-2.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink/90 disabled:opacity-60", children: "Save" }),
          /* @__PURE__ */ jsx("button", { onClick: () => del(p.key), disabled: busy, className: "rounded-full border-[1.5px] border-line px-4 py-2.5 text-[12px] text-rose transition-colors hover:border-rose disabled:opacity-60", children: "Delete" })
        ] }, p.key)),
        available.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-40", children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Add platform" }),
            /* @__PURE__ */ jsxs("select", { value: newKey, onChange: (e) => setNewKey(e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Choose\u2026" }),
              available.map((p) => /* @__PURE__ */ jsx("option", { value: p.key, children: p.label }, p.key))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-[180px] flex-1", children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "URL" }),
            /* @__PURE__ */ jsx("input", { value: newUrl, onChange: (e) => setNewUrl(e.target.value), placeholder: "https://\u2026" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: add, disabled: busy || !newKey || !newUrl.trim(), className: "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: "+ Add" })
        ] }),
        saved && /* @__PURE__ */ jsx("span", { className: "text-[13px] text-rose", children: "Saved \u2713" })
      ] })
    }
  );
}
function LogoRowSection({ title, sub, endpoint, labelField, labelText, placeholder }) {
  const [logos, setLogos] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => apiFetch(endpoint, { cache: "no-store" }).then((r) => r.json()).then((d) => setLogos(d.logos || [])).catch(() => setLogos([]));
  useEffect(() => {
    load();
  }, [endpoint]);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const add = async (e) => {
    e.preventDefault();
    if (!label.trim()) return setErr(`${labelText} is required.`);
    if (!file) return setErr("Upload a logo image.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("media", file);
    fd.append(labelField, label);
    const res = await apiFetch(endpoint, { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Upload failed.");
    setFile(null);
    setPreview("");
    setLabel("");
    load();
  };
  const patch = (id, body) => apiFetch(`${endpoint}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(load);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= logos.length) return;
    Promise.all([
      patch(logos[i].id, { order: j + 1 }),
      patch(logos[j].id, { order: i + 1 })
    ]);
  };
  const del = (id) => {
    if (!confirm("Delete this logo?")) return;
    apiFetch(`${endpoint}/${id}`, { method: "DELETE" }).then(load);
  };
  return /* @__PURE__ */ jsxs(Section, { title, sub, children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-ivory p-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: (e) => e.currentTarget.nextSibling.click(),
          className: "flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white transition-colors hover:border-rose",
          children: preview ? /* @__PURE__ */ jsx("img", { src: preview, alt: "", className: "h-full w-full object-contain p-1" }) : /* @__PURE__ */ jsx("span", { className: "text-[11px] text-ink-soft", children: "\uFF0B Logo" })
        }
      ),
      /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => pick(e.target.files?.[0]) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-[180px] flex-1", children: [
        /* @__PURE__ */ jsx("label", { className: "field-label", children: labelText }),
        /* @__PURE__ */ jsx("input", { value: label, onChange: (e) => setLabel(e.target.value), placeholder })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, className: "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Uploading\u2026" : "+ Add" }),
      err && /* @__PURE__ */ jsx("div", { className: "w-full text-[13px] text-lowstock-text", children: err })
    ] }),
    logos === null ? /* @__PURE__ */ jsx("div", { className: "h-16 skel rounded-2xl" }) : logos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No logos yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: logos.map((l, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-line bg-ivory p-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-12 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white", children: /* @__PURE__ */ jsx("img", { src: l.logo, alt: "", className: "h-full w-full object-contain p-1" }) }),
      /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 truncate text-sm font-medium", children: l[labelField] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => move(i, -1), disabled: i === 0, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2191" }),
        /* @__PURE__ */ jsx("button", { onClick: () => move(i, 1), disabled: i === logos.length - 1, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2193" }),
        /* @__PURE__ */ jsx("button", { onClick: () => patch(l.id, { active: !l.active }), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", l.active ? "border-line text-ink-soft" : "border-rose text-rose"), children: l.active ? "Hide" : "Show" }),
        /* @__PURE__ */ jsx("button", { onClick: () => del(l.id), className: "ml-1 text-ink-soft hover:text-lowstock-text", children: "\u2715" })
      ] })
    ] }, l.id)) })
  ] });
}
function BrandLogosSection() {
  const [logos, setLogos] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [form, setForm] = useState({ brand: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const load = () => apiFetch("/api/admin/brand-logos", { cache: "no-store" }).then((r) => r.json()).then((d) => setLogos(d.logos || [])).catch(() => setLogos([]));
  useEffect(() => {
    load();
  }, []);
  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPreviewType(f.type.startsWith("video") ? "video" : "image");
  };
  const reset = () => {
    setForm({ brand: "", description: "" });
    setFile(null);
    setPreview("");
    setEditing(null);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const submit = async () => {
    if (!form.brand.trim()) return setErr("Brand name is required.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("brand", form.brand);
    fd.append("description", form.description);
    if (file) fd.append("media", file);
    const url = editing ? `/api/admin/brand-logos/${editing}` : "/api/admin/brand-logos";
    const res = await apiFetch(url, { method: editing ? "PATCH" : "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Save failed.");
    setLogos(d.logos || []);
    reset();
  };
  const startEdit = (l) => {
    setEditing(l.id);
    setForm({ brand: l.brand, description: l.description || "" });
    setFile(null);
    setPreview(l.logo);
    setPreviewType(l.mediaType || "image");
    setErr("");
  };
  const patch = (id, body) => apiFetch(`/api/admin/brand-logos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(load);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= logos.length) return;
    Promise.all([
      patch(logos[i].id, { order: j + 1 }),
      patch(logos[j].id, { order: i + 1 })
    ]);
  };
  const del = (id) => {
    if (!confirm("Delete this brand?")) return;
    apiFetch(`/api/admin/brand-logos/${id}`, { method: "DELETE" }).then(load);
  };
  return /* @__PURE__ */ jsxs(
    Section,
    {
      title: "Brand logos",
      sub: "Brands shown on the homepage brand strip. Image or video + title + description; clicking one shows that brand's products.",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-3 rounded-2xl border border-line bg-ivory p-4 sm:grid-cols-[180px_1fr]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => fileRef.current?.click(),
              className: "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-white transition-colors hover:border-rose",
              children: preview ? /* @__PURE__ */ jsx(MediaThumb, { src: preview, type: previewType, className: "h-full w-full" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: "\uFF0B Image / video" })
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "image/*,video/mp4,video/webm",
              className: "hidden",
              onChange: (e) => pick(e.target.files?.[0])
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2.5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Brand name (title)" }),
              /* @__PURE__ */ jsx("input", { value: form.brand, onChange: (e) => setForm({ ...form, brand: e.target.value }), placeholder: "e.g. CeraVe (must match product Brand)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "field-label", children: "Description" }),
              /* @__PURE__ */ jsx("textarea", { rows: 2, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), placeholder: "Short line shown under the brand name\u2026" })
            ] }),
            err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: submit, disabled: busy, className: "rounded-full bg-rose px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Saving\u2026" : editing ? "Save changes" : "+ Add brand" }),
              editing && /* @__PURE__ */ jsx("button", { onClick: reset, className: "rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] transition-colors hover:border-rose", children: "Cancel" })
            ] })
          ] })
        ] }),
        logos === null ? /* @__PURE__ */ jsx("div", { className: "h-16 skel rounded-2xl" }) : logos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "No brands yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: logos.map((l, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-line bg-ivory p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-14 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white", children: /* @__PURE__ */ jsx(MediaThumb, { src: l.logo, type: l.mediaType, className: "h-full w-full" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: l.brand }),
            /* @__PURE__ */ jsx("div", { className: "truncate text-[12px] text-ink-soft", children: l.description || "\u2014" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => move(i, -1), disabled: i === 0, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2191" }),
            /* @__PURE__ */ jsx("button", { onClick: () => move(i, 1), disabled: i === logos.length - 1, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2193" }),
            /* @__PURE__ */ jsx("button", { onClick: () => patch(l.id, { active: !l.active }), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", l.active ? "border-line text-ink-soft" : "border-rose text-rose"), children: l.active ? "Hide" : "Show" }),
            /* @__PURE__ */ jsx("button", { onClick: () => startEdit(l), className: "rounded-full border-[1.5px] border-line px-3 py-1 text-[12px] transition-colors hover:border-rose hover:text-rose", children: "Edit" }),
            /* @__PURE__ */ jsx("button", { onClick: () => del(l.id), className: "ml-1 text-ink-soft hover:text-lowstock-text", children: "\u2715" })
          ] })
        ] }, l.id)) })
      ]
    }
  );
}
function PaymentLogosSection() {
  return /* @__PURE__ */ jsx(
    LogoRowSection,
    {
      title: "Footer \xB7 Payment logos (We accept)",
      sub: "Payment-method logos shown in the footer's \u201CWe accept\u201D row.",
      endpoint: "/api/admin/payment-logos",
      labelField: "name",
      labelText: "Payment name",
      placeholder: "e.g. bKash"
    }
  );
}
export {
  BannersManager as default
};
