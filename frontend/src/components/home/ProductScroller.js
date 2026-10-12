import { jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import ProductCard from "@/components/product/ProductCard.js";
function ProductScroller({ products = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    const onDown = (e) => {
      down = true;
      moved = false;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove("cursor-grabbing");
    };
    const onClickCapture = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: "no-scrollbar -mx-5 flex cursor-grab select-none gap-5 overflow-x-auto px-5 pb-2",
      children: products.map((p) => /* @__PURE__ */ jsx("div", { className: "w-[224px] flex-shrink-0 sm:w-[248px]", children: /* @__PURE__ */ jsx(ProductCard, { product: p }) }, p.id))
    }
  );
}
export {
  ProductScroller as default
};
