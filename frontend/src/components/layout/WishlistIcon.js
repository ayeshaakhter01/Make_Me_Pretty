import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { useCart } from "@/context/CartContext.js";
function WishlistIcon() {
  const { wishlist, hydrated } = useCart();
  const count = hydrated ? wishlist.length : 0;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: "/wishlist",
      "aria-label": `Wishlist, ${count} saved`,
      className: "relative flex h-9 w-9 items-center justify-center rounded-full text-[17px] text-ink transition-colors hover:text-rose",
      children: [
        "\u2661",
        count > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white", children: count })
      ]
    }
  );
}
export {
  WishlistIcon as default
};
