import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext.js";
import BagIcon from "@/components/ui/BagIcon.js";
import { cx } from "@/lib/utils.js";
function CartIcon() {
  const { count, openDrawer, hydrated } = useCart();
  const [pulse, setPulse] = useState(false);
  const prev = useRef(0);
  useEffect(() => {
    if (hydrated && count > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 650);
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count, hydrated]);
  useEffect(() => {
    prev.current = count;
  }, [count]);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: openDrawer,
      "aria-label": `Open bag, ${count} items`,
      className: cx(
        "bag-anim relative flex items-center transition-all",
        // desktop: pink pill; mobile: plain icon
        "md:gap-2 md:rounded-full md:bg-pink md:px-4 md:py-2.5 md:text-[13px] md:font-semibold md:text-rose-deep md:hover:bg-pink/80 md:hover:shadow-soft",
        pulse && "scale-[1.04]"
      ),
      children: [
        /* @__PURE__ */ jsx(BagIcon, { animating: pulse, className: "h-6 w-6 text-rose-deep md:h-[19px] md:w-[19px]" }),
        /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: "Bag" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "hidden h-5 min-w-[20px] items-center justify-center rounded-full bg-rose px-1 text-[11px] text-white transition-transform md:inline-flex",
              pulse && "animate-pop"
            ),
            children: hydrated ? count : 0
          }
        ),
        hydrated && count > 0 && /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold leading-none text-white md:hidden",
              pulse && "animate-pop"
            ),
            children: count
          }
        )
      ]
    }
  );
}
export {
  CartIcon as default
};
