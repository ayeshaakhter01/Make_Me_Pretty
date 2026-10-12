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
      className: "relative flex items-center whitespace-nowrap rounded-full bg-pink-soft px-4 py-2.5 text-[13px] font-semibold text-rose-deep ring-1 ring-inset ring-rose/25 transition-all hover:bg-pink hover:ring-rose/50",
      children: [
        "Wishlist",
        count > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold leading-none text-white", children: count })
      ]
    }
  );
}
export {
  WishlistIcon as default
};