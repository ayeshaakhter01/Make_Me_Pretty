import { jsx } from "react/jsx-runtime";
import { useCart } from "@/context/CartContext.js";
import { cx } from "@/lib/utils.js";
function WishlistButton({ productId, floating = false, className }) {
  const { isWished, toggleWishlist } = useCart();
  const wished = isWished(productId);
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "aria-label": wished ? "Remove from wishlist" : "Save to wishlist",
      "aria-pressed": wished,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      },
      className: cx(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/85 text-[15px] backdrop-blur transition-transform hover:scale-110",
        wished ? "text-rose" : "text-ink-soft",
        floating && "absolute right-3.5 top-3.5 z-10",
        className
      ),
      children: wished ? "\u2665" : "\u2661"
    }
  );
}
export {
  WishlistButton as default
};
