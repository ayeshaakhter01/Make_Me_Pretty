import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    /* Scroll container IS the backdrop. `min-h-full` + items-center centers the
       dialog when it fits, but lets it grow and stay scrollable-to-top when the
       form is taller than the viewport (e.g. the add-product form on laptops). */
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-[200] overflow-y-auto bg-ink/40 backdrop-blur-sm",
        onClick: onClose,
        children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
          "div",
          {
            role: "dialog",
            "aria-modal": "true",
            "aria-label": title,
            onClick: (e) => e.stopPropagation(),
            className: `relative my-8 w-full ${maxWidth} animate-fadeup rounded-3xl border border-line bg-ivory shadow-menu`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-line px-6 py-4", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl", children: title }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    "aria-label": "Close",
                    className: "text-2xl leading-none text-ink-soft transition-colors hover:text-ink",
                    children: "\xD7"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "px-6 py-5", children })
            ]
          }
        ) })
      }
    )
  );
}
export {
  Modal as default
};
