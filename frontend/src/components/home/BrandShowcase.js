import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import Link from "@/components/ui/Link.js";
import Reveal from "@/components/ui/Reveal.js";
function BrandTile({ b }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/shop?brand=${encodeURIComponent(b.brand)}`,
      draggable: false,
      className: "group mx-3 flex w-[210px] flex-shrink-0 flex-col items-center rounded-3xl border border-line bg-cream p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-soft sm:w-[240px]",
      children: [
        /* @__PURE__ */ jsx("div", { className: "card-shine mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4", children: b.logo ? b.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: b.logo, muted: true, loop: true, autoPlay: true, playsInline: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: b.logo, alt: b.brand, draggable: false, className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsx("span", { className: "break-words px-1 font-serif text-[20px] leading-tight text-ink", children: b.brand }) }),
        b.logo && /* @__PURE__ */ jsx("div", { className: "truncate font-serif text-[14.5px] text-ink group-hover:text-rose", children: b.brand }),
        b.description && /* @__PURE__ */ jsx("div", { className: "mt-0.5 line-clamp-1 text-[11.5px] text-ink-soft", children: b.description }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-rose opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: "Shop \u2192" })
      ]
    }
  );
}
function BrandShowcase({ brands = [] }) {
  const ref = useRef(null);
  const s = useRef({ down: false, moved: false, startX: 0, startScroll: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || brands.length === 0) return;
    const st = s.current;
    let raf;
    const tick = () => {
      if (!st.down) {
        el.scrollLeft += 1;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onDown = (e) => {
      st.down = true;
      st.moved = false;
      st.startX = e.pageX;
      st.startScroll = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e) => {
      if (!st.down) return;
      const dx = e.pageX - st.startX;
      if (Math.abs(dx) > 4) st.moved = true;
      let next = st.startScroll - dx;
      const half = el.scrollWidth / 2;
      if (next < 0) next += half;
      if (next >= half) next -= half;
      el.scrollLeft = next;
    };
    const onUp = () => {
      st.down = false;
      el.classList.remove("cursor-grabbing");
    };
    const onClick = (e) => {
      if (st.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [brands.length]);
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];
  return /* @__PURE__ */ jsxs("section", { className: "py-16", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mx-auto mb-8 flex max-w-[1200px] flex-wrap items-end justify-between gap-3 px-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Names you can trust" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "Brands we carry" })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/brands",
          className: "group inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-rose hover:text-rose",
          children: [
            "View all brands",
            /* @__PURE__ */ jsx("span", { className: "transition-transform duration-300 group-hover:translate-x-0.5", children: "\u2192" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: "no-scrollbar flex cursor-grab select-none overflow-x-auto px-4 pb-3",
        style: { scrollBehavior: "auto" },
        children: loop.map((b, i) => /* @__PURE__ */ jsx(BrandTile, { b }, `${b.id}-${i}`))
      }
    )
  ] });
}
export {
  BrandShowcase as default
};
