import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCart } from "@/context/CartContext.js";
import BagIcon from "@/components/ui/BagIcon.js";
import { cx } from "@/lib/utils.js";
function QuickAddButton({ product, className, label = "Add" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: handle,
      "aria-label": `Add ${product.name} to bag`,
      className: cx(
        "bag-anim inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-[0.04em] transition-all duration-300",
        added ? "bg-gold text-white shadow-[0_6px_16px_rgba(198,161,91,.35)]" : "bg-rose text-white hover:-translate-y-0.5 hover:bg-rose-deep hover:shadow-rose",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(BagIcon, { animating: added, className: "h-[17px] w-[17px]" }),
        added ? "Added" : label
      ]
    }
  );
}
export {
  QuickAddButton as default
};
