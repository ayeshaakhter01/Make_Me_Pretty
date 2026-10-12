import { jsx } from "react/jsx-runtime";
import { useCart } from "@/context/CartContext.js";
import { cx } from "@/lib/utils.js";
function AddComboButton({ combo, className, children }) {
  const { addToCart, openDrawer } = useCart();
  const add = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const first = combo.products[0] || {};
    addToCart({
      id: `combo:${combo.id}`,
      name: combo.name,
      price: combo.price,
      shape: first.shape || "box",
      c1: first.c1 || "#F6DEE3",
      c2: first.c2 || "#DBA8B1"
    });
    openDrawer();
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: add,
      disabled: !combo.inStock,
      className: cx(
        "rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      children: combo.inStock ? children || "Add bundle" : "Out of stock"
    }
  );
}
export {
  AddComboButton as default
};
