import { jsx, jsxs } from "react/jsx-runtime";
function StatCard({ label, value, accent = "var(--ink)" }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-line bg-cream p-5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.1em] text-ink-soft", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1.5 font-serif text-[28px]", style: { color: accent }, children: value })
  ] });
}
export {
  StatCard as default
};
