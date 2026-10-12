import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import ProductPlaceholder from "@/components/ui/ProductPlaceholder.js";
import { useCart } from "@/context/CartContext.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function CartLineItem({ item, onNavigate, compact = false }) {
  const { setQty, removeFromCart } = useCart();
  const isCombo = String(item.id).startsWith("combo:");
  const href = isCombo ? "/combo" : `/product/${item.id}`;
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-4 border-b border-line py-4", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href,
        onClick: onNavigate,
        className: cx(
          "flex flex-shrink-0 items-center justify-center rounded-2xl border border-line",
          compact ? "h-20 w-20" : "h-24 w-24"
        ),
        style: { background: `linear-gradient(160deg, ${item.c1}, #fff)` },
        children: /* @__PURE__ */ jsx(ProductPlaceholder, { shape: item.shape, c1: item.c1, c2: item.c2, size: 0.4 })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href,
          onClick: onNavigate,
          className: "font-serif text-base leading-snug hover:text-rose",
          children: item.name
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-[13px] text-ink-soft", children: bdt(item.price) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Decrease quantity",
            onClick: () => setQty(item.id, item.qty - 1),
            className: "flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-line text-base transition-colors hover:border-rose hover:text-rose",
            children: "\u2212"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "min-w-[18px] text-center text-sm", children: item.qty }),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Increase quantity",
            onClick: () => setQty(item.id, item.qty + 1),
            className: "flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-line text-base transition-colors hover:border-rose hover:text-rose",
            children: "+"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => removeFromCart(item.id),
            className: "ml-auto text-xs text-ink-soft underline transition-colors hover:text-rose",
            children: "Remove"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: bdt(item.price * item.qty) })
  ] });
}
export {
  CartLineItem as default
};
