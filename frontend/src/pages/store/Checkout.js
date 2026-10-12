import { jsx, jsxs } from "react/jsx-runtime";
import { useCart } from "@/context/CartContext.js";
import CheckoutForm from "@/components/checkout/CheckoutForm.js";
import Button from "@/components/ui/Button.js";
function CheckoutPage() {
  const { cart, hydrated } = useCart();
  if (!hydrated) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1000px] px-5 py-16", children: /* @__PURE__ */ jsx("div", { className: "mx-auto h-8 w-40 skel rounded-lg" }) });
  }
  if (cart.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1000px] px-5 py-24 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[30px]", children: "Your bag is empty" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6 mt-2 text-ink-soft", children: "Add a product before checking out." }),
      /* @__PURE__ */ jsx(Button, { href: "/shop", children: "Go to shop" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1000px] px-5 py-12", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 text-center font-serif text-[36px] font-normal", children: "Checkout" }),
    /* @__PURE__ */ jsx(CheckoutForm, {})
  ] });
}
export {
  CheckoutPage as default
};
