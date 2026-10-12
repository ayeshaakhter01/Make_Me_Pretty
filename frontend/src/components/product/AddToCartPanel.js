import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCart } from "@/context/CartContext.js";
import BagIcon from "@/components/ui/BagIcon.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function AddToCartPanel({ product }) {
  const { addToCart, openDrawer, toggleWishlist, isWished } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const wished = isWished(product.id);
  const add = () => {
    addToCart(product, qty);
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      openDrawer();
    }, 550);
  };
  const soldOut = product.stock <= 0;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-stretch gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-full border-[1.5px] border-line px-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          "aria-label": "Decrease quantity",
          onClick: () => setQty((q) => Math.max(1, q - 1)),
          className: "text-lg text-ink-soft transition-colors hover:text-rose",
          children: "\u2212"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "min-w-[20px] text-center text-sm", children: qty }),
      /* @__PURE__ */ jsx(
        "button",
        {
          "aria-label": "Increase quantity",
          onClick: () => setQty((q) => Math.min(product.stock, q + 1)),
          className: "text-lg text-ink-soft transition-colors hover:text-rose",
          children: "+"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: add,
        disabled: soldOut,
        className: cx(
          "bag-anim flex flex-1 basis-48 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-[0.04em] text-white transition-all duration-300",
          soldOut ? "cursor-not-allowed bg-ink-soft" : adding ? "bg-gold shadow-[0_6px_16px_rgba(198,161,91,.35)]" : "bg-rose hover:-translate-y-0.5 hover:bg-rose-deep hover:shadow-rose"
        ),
        children: [
          /* @__PURE__ */ jsx(BagIcon, { animating: adding }),
          soldOut ? "Sold out" : adding ? "Added" : `Add to Bag \u2014 ${bdt(product.price * qty)}`
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => toggleWishlist(product.id),
        className: "flex items-center gap-2 rounded-full border-[1.5px] border-ink px-6 py-3.5 text-sm transition-colors hover:bg-ink hover:text-ivory",
        children: wished ? "\u2665 Saved" : "\u2661 Save"
      }
    )
  ] });
}
export {
  AddToCartPanel as default
};
