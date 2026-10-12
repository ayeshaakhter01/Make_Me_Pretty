import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import Reveal from "@/components/ui/Reveal.js";
import { BLOG_POSTS } from "@/data/blogPosts.js";

function BlogReader({ post, onClose }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const onScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setPct(max > 0 ? (el.scrollTop / max) * 100 : 0);
  };
  return jsx("div", {
    className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 pt-24 backdrop-blur-sm sm:p-6 sm:pt-24",
    onClick: onClose,
    children: jsxs("div", {
      className: "relative w-fit min-w-[min(92vw,480px)] max-w-full animate-[pop_.35s_ease]",
      onClick: (e) => e.stopPropagation(),
      children: [
        jsx("button", { onClick: onClose, "aria-label": "Close", className: "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white", children: "\u2715" }),
        jsxs("div", {
          onScroll,
          className: "max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl",
          children: [
            jsx("div", { className: "sticky top-0 z-10 h-1 bg-pink-soft", children: jsx("div", { className: "h-full bg-rose", style: { width: pct + "%" } }) }),
            jsx("img", { src: post.image, alt: post.title, className: "block h-auto max-w-full" }),
            jsxs("div", {
              className: "w-0 min-w-full px-6 pb-10 pt-6 sm:px-10",
              children: [
                jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: post.tag + " \u00B7 " + post.read }),
                jsx("h2", { className: "mt-2 font-serif text-[28px] font-normal leading-tight sm:text-[34px]", children: post.title }),
                ...post.body.map((t, i) => jsx("p", { className: "mt-5 text-[16px] leading-8 text-ink/80", children: t }, i)),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}

function BlogSection() {
  const ref = useRef(null);
  const [open, setOpen] = useState(null);
  const openRef = useRef(null);
  openRef.current = open;
  const loop = [...BLOG_POSTS, ...BLOG_POSTS];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    let pos = el.scrollLeft;
    let down = false, hover = false, moved = false, startX = 0, startScroll = 0;
    const tick = () => {
      if (!down && !hover && !openRef.current) {
        pos += 0.6; // scroll speed: bigger number = faster
        const half = el.scrollWidth / 2;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    const onDown = (e) => { down = true; moved = false; startX = e.pageX; startScroll = el.scrollLeft; el.classList.add("cursor-grabbing"); };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => { down = false; el.classList.remove("cursor-grabbing"); };
    const onEnter = () => { hover = true; };
    const onLeave = () => { hover = false; };
    const onClickCapture = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClickCapture, true);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return jsxs("section", { className: "mx-auto max-w-[1200px] px-5 py-16", children: [
    jsxs(Reveal, { className: "mb-8", children: [
      jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Tips, tutorials & stories" }),
      jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "Our Blog" }),
    ] }),
    jsx("div", {
      ref,
      className: "no-scrollbar flex cursor-grab select-none overflow-x-auto pb-3",
      style: { scrollBehavior: "auto" },
      children: loop.map((p, i) =>
        jsxs("button", {
          onClick: () => setOpen(p),
          className: "mr-5 flex w-[260px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition-shadow hover:shadow-md sm:w-[290px]",
          children: [
            jsx("img", { src: p.image, alt: p.title, draggable: false, className: "h-40 w-full object-cover object-top" }),
            jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
              jsx("div", { className: "text-[11px] font-semibold uppercase tracking-widest text-rose", children: p.tag }),
              jsx("h3", { className: "mt-1 line-clamp-2 font-serif text-lg leading-snug", children: p.title }),
              jsx("p", { className: "mt-1 line-clamp-2 text-sm text-ink/70", children: p.excerpt }),
              jsx("span", { className: "mt-3 text-[13px] font-medium text-rose", children: "Read blog \u2192" }),
            ] }),
          ],
        }, p.id + "-" + i)
      ),
    }),
    open && jsx(BlogReader, { post: open, onClose: () => setOpen(null) }),
  ] });
}

export { BlogSection as default };