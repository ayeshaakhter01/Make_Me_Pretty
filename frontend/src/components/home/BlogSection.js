import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
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
  const [open, setOpen] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    const s = swiperRef.current;
    if (!s || !s.autoplay) return;
    if (open) s.autoplay.stop();
    else s.autoplay.start();
  }, [open]);

  return jsxs("section", { className: "blog-coverflow mx-auto max-w-[1200px] px-5 py-16", children: [
    jsxs(Reveal, { className: "text-center", children: [
      jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Tips, tutorials & stories" }),
      jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "Our Blog" }),
    ] }),
    jsx(Swiper, {
      onSwiper: (s) => { swiperRef.current = s; },
      style: { marginLeft: "-20px", marginRight: "-20px" },
      modules: [EffectCoverflow, Autoplay, Pagination],
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      speed: 700,
      autoplay: { delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { clickable: true },
      slidesPerView: 1.3,
      coverflowEffect: { rotate: 8, stretch: 0, depth: 120, scale: 0.9, modifier: 1, slideShadows: false },
      breakpoints: { 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3 } },
      children: BLOG_POSTS.map((p) =>
        jsx(SwiperSlide, { className: "!h-auto px-1.5 py-5", children:
          jsxs("button", {
            onClick: () => setOpen(p),
            className: "blog-card flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm",
            children: [
              jsx("img", { src: p.image, alt: p.title, draggable: false, className: "h-40 w-full object-cover object-top" }),
              jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
                jsx("div", { className: "text-[11px] font-semibold uppercase tracking-widest text-rose", children: p.tag }),
                jsx("h3", { className: "mt-1 line-clamp-2 font-serif text-lg leading-snug", children: p.title }),
                jsx("p", { className: "mt-1 line-clamp-2 text-sm text-ink/70", children: p.excerpt }),
                jsx("span", { className: "mt-3 text-[13px] font-medium text-rose", children: "Read blog \u2192" }),
              ] }),
            ],
          }),
        }, p.id)
      ),
    }),
    open && jsx(BlogReader, { post: open, onClose: () => setOpen(null) }),
    jsx("style", { children: `
      .blog-coverflow .swiper { padding: 56px 0 96px; }
      .blog-coverflow .swiper-slide { height: auto; display: flex; }
      .blog-coverflow .blog-card {
        transition: box-shadow 0.7s ease, border-color 0.7s ease, transform 0.3s ease;
      }
      .blog-coverflow .swiper-slide-active .blog-card {
        border-color: rgba(183, 110, 121, 0.35);
        box-shadow:
          0 0 0 1.5px rgba(255, 255, 255, 0.85),
          0 0 22px 0 rgba(214, 90, 122, 0.30),
          0 0 56px 6px rgba(214, 90, 122, 0.18),
          0 18px 50px rgba(126, 44, 64, 0.16);
      }
      .blog-coverflow .blog-card:hover { transform: translateY(-4px); }
      .blog-coverflow .swiper-pagination { bottom: 20px !important; }
      .blog-coverflow .swiper-pagination-bullet { background: var(--rose); opacity: 0.35; transition: all 0.3s ease; }
      .blog-coverflow .swiper-pagination-bullet-active { opacity: 1; width: 24px; border-radius: 999px; }
    ` }),
  ] });
}

export { BlogSection as default };