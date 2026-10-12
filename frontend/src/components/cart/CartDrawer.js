import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext.js";
import CartLineItem from "@/components/cart/CartLineItem.js";
import CartSummary from "@/components/cart/CartSummary.js";
import EmptyCart from "@/components/cart/EmptyCart.js";
import { bdt } from "@/lib/format.js";
import { cx } from "@/lib/utils.js";
function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, subtotal } = useCart();
  const navigate = useNavigate();
  const goCheckout = () => {
    closeDrawer();
    navigate("/checkout");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: closeDrawer,
        className: cx(
          "fixed inset-0 z-[100] bg-ink/35 transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cx(
          "fixed inset-y-0 right-0 z-[110] flex w-[min(420px,92vw)] flex-col bg-ivory shadow-drawer transition-transform duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)]",
          drawerOpen ? "translate-x-0" : "translate-x-[105%]"
        ),
        "aria-hidden": !drawerOpen,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-line px-6 py-5", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-serif text-[22px] font-medium", children: [
              "Your Bag (",
              cart.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: closeDrawer,
                "aria-label": "Close bag",
                className: "text-2xl text-ink-soft",
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6", children: cart.length === 0 ? /* @__PURE__ */ jsx(EmptyCart, { onBrowse: closeDrawer }) : cart.map((item) => /* @__PURE__ */ jsx(CartLineItem, { item, onNavigate: closeDrawer, compact: true }, item.id)) }),
          cart.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-line bg-cream px-6 py-5", children: [
            /* @__PURE__ */ jsx(CartSummary, {}),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: goCheckout,
                className: "mt-4 w-full rounded-full bg-rose py-3.5 text-sm font-medium text-white transition-colors hover:bg-rose-deep",
                children: [
                  "Checkout \u2014 ",
                  bdt(subtotal)
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: closeDrawer,
                className: "mt-2 w-full text-center text-[13px] text-ink-soft underline",
                children: "Continue shopping"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
export {
  CartDrawer as default
};
