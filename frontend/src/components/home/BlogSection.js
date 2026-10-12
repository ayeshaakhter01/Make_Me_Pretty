import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import { cx } from "@/lib/utils.js";
import Reveal from "@/components/ui/Reveal.js";
function Media({ b, className, controls = false }) {
  if (!b.media)
    return /* @__PURE__ */ jsx("div", { className: cx("flex items-center justify-center bg-pink-soft text-3xl text-rose/40", className), children: "\u270E" });
  return b.mediaType === "video" ? /* @__PURE__ */ jsx(
    "video",
    {
      src: b.media,
      className: cx("object-cover", className),
      muted: !controls,
      loop: !controls,
      autoPlay: !controls,
      playsInline: true,
      controls
    }
  ) : /* @__PURE__ */ jsx("img", { src: b.media, alt: b.title, className: cx("object-cover", className) });
}
function BlogModal({ blog, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const hasMedia = !!blog.media;
  const isVideo = blog.mediaType === "video" && blog.media;
  const closeBtn = /* @__PURE__ */ jsx(
    "button",
    {
      onClick: onClose,
      "aria-label": "Close",
      className: "absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-lg text-white backdrop-blur-sm transition-colors hover:bg-ink",
      children: "\u2715"
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: onClose,
        className: "absolute inset-0 bg-ink/55 backdrop-blur-lg animate-[fadeup_.3s_ease]"
      }
    ),
    hasMedia ? (
      /* Media fills the whole panel; the caption is overlaid — no body block.
         Balanced landscape, no rounded corners. */
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex h-[min(86vh,660px)] w-[min(94vw,940px)] items-center justify-center overflow-hidden bg-black shadow-2xl animate-[pop_.35s_ease]", children: [
        closeBtn,
        isVideo ? /* @__PURE__ */ jsx("video", { src: blog.media, controls: true, autoPlay: true, playsInline: true, className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsx("img", { src: blog.media, alt: blog.title, className: "h-full w-full object-cover" }),
        (blog.title || blog.excerpt) && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-6 pb-8 pt-28 sm:px-12", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif text-[clamp(24px,3vw,38px)] font-normal leading-tight text-white", children: blog.title }),
          blog.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-2 text-[15px] text-white/85", children: blog.excerpt })
        ] })
      ] })
    ) : (
      /* No media → an all-text reader on a cream panel. */
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex max-h-[86vh] w-[min(94vw,720px)] flex-col overflow-hidden bg-cream shadow-2xl animate-[pop_.35s_ease]", children: [
        closeBtn,
        /* @__PURE__ */ jsxs("div", { className: "overflow-y-auto px-6 py-10 sm:px-12 sm:py-12", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-tight", children: blog.title }),
          blog.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-2 text-[15px] font-medium text-rose", children: blog.excerpt }),
          blog.body && /* @__PURE__ */ jsx("div", { className: "mt-5 whitespace-pre-line text-[15.5px] leading-relaxed text-ink-soft", children: blog.body })
        ] })
      ] })
    )
  ] });
}
function BlogCard({ b, onOpen }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: onOpen,
      className: "blog-card group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-cream text-left transition-all duration-300",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "card-shine relative overflow-hidden", children: [
          /* @__PURE__ */ jsx(Media, { b, className: "aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105" }),
          b.mediaType === "video" && b.media && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-lg text-rose shadow-soft", children: "\u25B6" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-serif text-lg leading-snug group-hover:text-rose", children: b.title }),
          b.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-soft", children: b.excerpt }),
          /* @__PURE__ */ jsx("span", { className: "mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose", children: "Read more \u2192" })
        ] })
      ]
    }
  );
}
function BlogSection({ blogs = [] }) {
  const [open, setOpen] = useState(null);
  if (blogs.length === 0) return null;
  const useCoverflow = blogs.length >= 4;
  const slides = useCoverflow && blogs.length < 6 ? Array.from({ length: Math.ceil(6 / blogs.length) }, () => blogs).flat() : blogs;
  return /* @__PURE__ */ jsxs("section", { className: "blog-coverflow py-16", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mx-auto mb-6 max-w-[1200px] px-5 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Tips, tutorials & stories" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "Our Blog" })
    ] }),
    useCoverflow ? /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [EffectCoverflow, Autoplay, Pagination],
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        speed: 620,
        autoplay: { delay: 3400, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { clickable: true },
        slidesPerView: 1.15,
        coverflowEffect: { rotate: 3, stretch: -14, depth: 110, scale: 0.92, modifier: 1, slideShadows: false },
        breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1440: { slidesPerView: 3.4 } },
        children: slides.map((b, i) => /* @__PURE__ */ jsx(SwiperSlide, { className: "!h-auto px-1.5 py-5", children: /* @__PURE__ */ jsx(BlogCard, { b, onOpen: () => setOpen(b) }) }, `${b.id}-${i}`))
      }
    ) : /* @__PURE__ */ jsx("div", { className: "mx-auto flex max-w-[1100px] flex-wrap justify-center gap-6 px-5", children: blogs.map((b) => /* @__PURE__ */ jsx("div", { className: "w-full sm:w-[340px]", children: /* @__PURE__ */ jsx(BlogCard, { b, onOpen: () => setOpen(b) }) }, b.id)) }),
    open && /* @__PURE__ */ jsx(BlogModal, { blog: open, onClose: () => setOpen(null) }),
    /* @__PURE__ */ jsx("style", { children: `
        .blog-coverflow .swiper { padding: 8px 0 52px; }
        .blog-coverflow .swiper-slide { height: auto; display: flex; }
        .blog-coverflow .swiper-slide-active .blog-card {
          border-color: rgba(183, 110, 121, 0.5);
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 0.9),
            0 0 26px 2px rgba(214, 90, 122, 0.55),
            0 0 68px 14px rgba(199, 74, 108, 0.34),
            0 24px 70px rgba(126, 44, 64, 0.26);
        }
        .blog-coverflow .blog-card:hover {
          transform: translateY(-4px);
          border-color: rgba(183, 110, 121, 0.45);
          box-shadow:
            0 0 0 1.5px rgba(255, 255, 255, 0.9),
            0 0 22px 2px rgba(214, 90, 122, 0.35),
            0 18px 44px rgba(126, 44, 64, 0.18);
        }
        .blog-coverflow .swiper-pagination { bottom: 12px !important; }
        .blog-coverflow .swiper-pagination-bullet { background: var(--rose); opacity: 0.35; transition: all 0.3s ease; }
        .blog-coverflow .swiper-pagination-bullet-active { opacity: 1; width: 24px; border-radius: 999px; }
      ` })
  ] });
}
export {
  BlogSection as default
};
