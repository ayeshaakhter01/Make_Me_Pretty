import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils.js";
function BlogManager() {
  const [posts, setPosts] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [form, setForm] = useState({ title: "", excerpt: "", body: "" });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const load = () => apiFetch("/api/admin/blogs", { cache: "no-store" }).then((r) => r.json()).then((d) => setPosts(d.blogs || [])).catch(() => setPosts([]));
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
    setForm({ title: "", excerpt: "", body: "" });
    setFile(null);
    setPreview("");
    setEditing(null);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const submit = async () => {
    if (!form.title.trim()) return setErr("Title is required.");
    setErr("");
    setBusy(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("body", form.body);
    if (file) fd.append("media", file);
    const url = editing ? `/api/admin/blogs/${editing}` : "/api/admin/blogs";
    const res = await apiFetch(url, { method: editing ? "PATCH" : "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Save failed.");
    setPosts(d.blogs || []);
    reset();
  };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt || "", body: p.body || "" });
    setFile(null);
    setPreview(p.media);
    setPreviewType(p.mediaType || "image");
    setErr("");
  };
  const patch = (id, body) => apiFetch(`/api/admin/blogs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then((r) => r.json()).then((d) => setPosts(d.blogs || []));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= posts.length) return;
    Promise.all([patch(posts[i].id, { order: j + 1 }), patch(posts[j].id, { order: i + 1 })]);
  };
  const del = (id) => {
    if (!confirm("Delete this post?")) return;
    apiFetch(`/api/admin/blogs/${id}`, { method: "DELETE" }).then((r) => r.json()).then((d) => setPosts(d.blogs || []));
  };
  const Thumb = ({ src, type, className }) => !src ? /* @__PURE__ */ jsx("div", { className: cx("flex items-center justify-center bg-ivory-2 text-xs text-ink-soft", className), children: "\u2014" }) : type === "video" ? /* @__PURE__ */ jsx("video", { src, muted: true, loop: true, autoPlay: true, playsInline: true, className: cx("object-cover", className) }) : /* @__PURE__ */ jsx("img", { src, alt: "", className: cx("object-cover", className) });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-serif text-xl", children: "Blog" }),
      /* @__PURE__ */ jsx("p", { className: "text-[13px] text-ink-soft", children: "Image / video + text posts. Active ones appear in the storefront \u201COur Blog\u201D section; clicking one opens it full-screen." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-card border border-line bg-cream p-4 sm:grid-cols-[220px_1fr]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => fileRef.current?.click(),
          className: "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-ivory transition-colors hover:border-rose",
          children: preview ? /* @__PURE__ */ jsx(Thumb, { src: preview, type: previewType, className: "h-full w-full" }) : /* @__PURE__ */ jsx("span", { className: "text-[12px] text-ink-soft", children: "\uFF0B Image / video" })
        }
      ),
      /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/*,video/mp4,video/webm", className: "hidden", onChange: (e) => pick(e.target.files?.[0]) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2.5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Title" }),
          /* @__PURE__ */ jsx("input", { value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), placeholder: "5 steps to a monsoon-proof glow" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Excerpt (shown on the card)" }),
          /* @__PURE__ */ jsx("input", { value: form.excerpt, onChange: (e) => setForm({ ...form, excerpt: e.target.value }), placeholder: "A short teaser line\u2026" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "field-label", children: "Body (shown when opened)" }),
          /* @__PURE__ */ jsx("textarea", { rows: 4, value: form.body, onChange: (e) => setForm({ ...form, body: e.target.value }), placeholder: "Full post text\u2026" })
        ] }),
        err && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-lowstock-text", children: err }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: submit, disabled: busy, className: "rounded-full bg-rose px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60", children: busy ? "Saving\u2026" : editing ? "Save changes" : "+ Add post" }),
          editing && /* @__PURE__ */ jsx("button", { onClick: reset, className: "rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] transition-colors hover:border-rose", children: "Cancel" })
        ] })
      ] })
    ] }),
    posts === null ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-card" }) : posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "rounded-card border border-line bg-cream px-5 py-4 text-[13px] text-ink-soft", children: "No posts yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: posts.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-card border border-line bg-cream p-3", children: [
      /* @__PURE__ */ jsx(Thumb, { src: p.media, type: p.mediaType, className: "h-14 w-24 flex-shrink-0 rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: p.title }),
        /* @__PURE__ */ jsx("div", { className: "truncate text-[12px] text-ink-soft", children: p.excerpt || p.body || "\u2014" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => move(i, -1), disabled: i === 0, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2191" }),
        /* @__PURE__ */ jsx("button", { onClick: () => move(i, 1), disabled: i === posts.length - 1, className: "h-7 w-7 rounded-full border border-line text-xs disabled:opacity-30", children: "\u2193" }),
        /* @__PURE__ */ jsx("button", { onClick: () => patch(p.id, { active: !p.active }), className: cx("rounded-full border-[1.5px] px-3 py-1 text-[12px]", p.active ? "border-line text-ink-soft" : "border-rose text-rose"), children: p.active ? "Hide" : "Show" }),
        /* @__PURE__ */ jsx("button", { onClick: () => startEdit(p), className: "rounded-full border-[1.5px] border-line px-3 py-1 text-[12px] transition-colors hover:border-rose hover:text-rose", children: "Edit" }),
        /* @__PURE__ */ jsx("button", { onClick: () => del(p.id), className: "ml-1 text-ink-soft hover:text-lowstock-text", children: "\u2715" })
      ] })
    ] }, p.id)) })
  ] });
}
export {
  BlogManager as default
};
