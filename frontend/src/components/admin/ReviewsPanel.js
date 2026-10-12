import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useCallback, useEffect, useState } from "react";
import Badge from "@/components/ui/Badge.js";
import { cx } from "@/lib/utils.js";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "hidden", label: "Hidden" }
];
function timeAgo(iso) {
  if (!iso) return "\u2014";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function ReviewsPanel() {
  const [reviews, setReviews] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const load = useCallback(
    () => apiFetch("/api/admin/reviews", { cache: "no-store" }).then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => setReviews([])),
    []
  );
  useEffect(() => {
    load();
    const t = setInterval(load, 2e4);
    return () => clearInterval(t);
  }, [load]);
  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (res.ok) setReviews(d.reviews || []);
    } finally {
      setBusyId(null);
    }
  };
  const del = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusyId(id);
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (res.ok) setReviews(d.reviews || []);
    } finally {
      setBusyId(null);
    }
  };
  if (reviews === null) return /* @__PURE__ */ jsx("div", { className: "h-40 skel rounded-card" });
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const list = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-xl", children: "Customer Reviews" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[13px] text-ink-soft", children: [
          "Approve, hide or delete submissions. Only approved reviews show on the storefront.",
          pendingCount > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1.5 font-semibold text-rose", children: [
            pendingCount,
            " pending"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: FILTERS.map((f) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setFilter(f.key),
          className: cx(
            "rounded-full border-[1.5px] px-4 py-1.5 text-[12.5px] transition-all",
            filter === f.key ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-ink-soft hover:border-rose"
          ),
          children: f.label
        },
        f.key
      )) })
    ] }),
    list.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "rounded-card border border-line bg-cream px-5 py-4 text-[13px] text-ink-soft", children: [
      "No ",
      filter === "all" ? "" : filter + " ",
      "reviews."
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: list.map((r) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cx(
          "flex flex-wrap items-start gap-4 rounded-card border bg-cream p-4",
          r.status === "pending" ? "border-rose/50" : "border-line"
        ),
        children: [
          r.media && /* @__PURE__ */ jsx("span", { className: "h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-line", children: r.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: r.media, muted: true, loop: true, autoPlay: true, playsInline: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: r.media, alt: "", className: "h-full w-full object-cover" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: r.name }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  tone: r.status === "approved" ? "gold" : r.status === "pending" ? "pink" : "neutral",
                  children: r.status
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] text-ink-soft", children: timeAgo(r.createdAt) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1.5 text-[13.5px] leading-relaxed text-ink-soft", children: [
              "\u201C",
              r.text,
              "\u201D"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            r.status !== "approved" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setStatus(r.id, "approved"),
                disabled: busyId === r.id,
                className: "rounded-full bg-rose px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-rose-deep disabled:opacity-60",
                children: "Approve"
              }
            ),
            r.status === "approved" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setStatus(r.id, "hidden"),
                disabled: busyId === r.id,
                className: "rounded-full border-[1.5px] border-line px-4 py-1.5 text-[12px] transition-colors hover:border-rose hover:text-rose disabled:opacity-60",
                children: "Hide"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => del(r.id),
                disabled: busyId === r.id,
                "aria-label": "Delete review",
                className: "ml-1 text-ink-soft transition-colors hover:text-lowstock-text disabled:opacity-60",
                children: "\u2715"
              }
            )
          ] })
        ]
      },
      r.id
    )) })
  ] });
}
export {
  ReviewsPanel as default
};
