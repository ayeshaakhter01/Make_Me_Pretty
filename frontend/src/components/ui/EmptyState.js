import { jsx, jsxs } from "react/jsx-runtime";
function EmptyState({
  icon = "\u{1F338}",
  title,
  message,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center py-16 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-24 w-20 items-center justify-center rounded-[60px_60px_16px_16px] bg-pink-soft text-4xl", children: icon }),
    /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl", children: title }),
    message && /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-sm text-ink-soft", children: message }),
    children && /* @__PURE__ */ jsx("div", { className: "mt-6", children })
  ] });
}
export {
  EmptyState as default
};
