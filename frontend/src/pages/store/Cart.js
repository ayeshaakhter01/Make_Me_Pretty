import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useCart } from "@/context/CartContext.js";
import { useSettings } from "@/context/SettingsContext.js";
import CartLineItem from "@/components/cart/CartLineItem.js";
import EmptyCart from "@/components/cart/EmptyCart.js";
import { bdt } from "@/lib/format.js";
function CartPage() {
  const { cart, subtotal, hydrated } = useCart();
  const { freeDeliveryThreshold: threshold } = useSettings();
  if (!hydrated) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1000px] px-5 py-16", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-48 skel rounded-lg" }) });
  }
  if (cart.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1000px] px-5 py-16", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-4 text-center font-serif text-[36px] font-normal", children: "Your Bag" }),
      /* @__PURE__ */ jsx(EmptyCart, {})
    ] });
  }
  const remaining = Math.max(threshold - subtotal, 0);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1000px] px-5 py-12", children: [
    /* @__PURE__ */ jsxs("h1", { className: "mb-8 text-center font-serif text-[36px] font-normal", children: [
      "Your Bag (",
      cart.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.7fr_1fr]", children: [
      /* @__PURE__ */ jsx("div", { children: cart.map((item) => /* @__PURE__ */ jsx(CartLineItem, { item }, item.id)) }),
      /* @__PURE__ */ jsx("aside", { children: /* @__PURE__ */ jsxs("div", { className: "sticky top-28 rounded-card border border-line bg-cream p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-4 font-serif text-xl", children: "Order Summary" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-line pb-3 text-sm text-ink-soft", children: [
          /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: bdt(subtotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-line py-3 text-sm text-ink-soft", children: [
          /* @__PURE__ */ jsx("span", { children: "Delivery" }),
          /* @__PURE__ */ jsx("span", { children: remaining === 0 ? "Free \u2713" : "Calculated at checkout" })
        ] }),
        remaining > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[12.5px] text-ink-soft", children: [
          "Add ",
          bdt(remaining),
          " more to unlock free delivery."
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/checkout",
            className: "mt-5 block w-full rounded-full bg-rose py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-rose-deep",
            children: "Proceed to Checkout"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/shop",
            className: "mt-3 block text-center text-[13px] text-ink-soft underline",
            children: "Continue shopping"
          }
        )
      ] }) })
    ] })
  ] });
}
export {
  CartPage as default
};
