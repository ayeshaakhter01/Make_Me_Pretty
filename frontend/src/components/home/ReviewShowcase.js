import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import StarRating from "@/components/product/StarRating.js";
import Reveal from "@/components/ui/Reveal.js";
import { cx } from "@/lib/utils.js";
function ReviewMedia({ r }) {
  if (!r.media) return null;
  const cls = "h-40 w-full object-cover";
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-t-card", children: r.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: r.media, muted: true, loop: true, autoPlay: true, playsInline: true, className: cls }) : /* @__PURE__ */ jsx("img", { src: r.media, alt: `${r.name}'s photo`, className: cls }) });
}
function ReviewLightbox({ r, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const hasMedia = !!r.media;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-[200] overflow-y-auto bg-ink/50 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
        "div",
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": `Review by ${r.name}`,
          onClick: (e) => e.stopPropagation(),
          className: cx(
            "relative my-6 w-full animate-fadeup overflow-hidden rounded-3xl border border-line bg-ivory shadow-menu",
            hasMedia ? "max-w-[900px] md:grid md:grid-cols-2" : "max-w-[560px]"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Close",
                className: "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-2xl leading-none text-ink-soft shadow-soft transition-colors hover:text-ink",
                children: "\xD7"
              }
            ),
            hasMedia && /* @__PURE__ */ jsx("div", { className: "relative aspect-square w-full bg-pink-soft md:aspect-auto md:min-h-[460px]", children: r.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: r.media, controls: true, autoPlay: true, loop: true, playsInline: true, className: "absolute inset-0 h-full w-full bg-ink object-contain" }) : /* @__PURE__ */ jsx("img", { src: r.media, alt: `${r.name}'s photo`, className: "absolute inset-0 h-full w-full object-contain" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center p-7 md:p-9", children: [
              /* @__PURE__ */ jsx(StarRating, { value: r.rating, className: "!text-[18px]" }),
              /* @__PURE__ */ jsxs("blockquote", { className: "my-5 whitespace-pre-line text-[16px] leading-[1.8]", children: [
                "\u201C",
                r.text,
                "\u201D"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[14px] text-ink-soft", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: r.name }),
                r.location && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " \xB7 ",
                  r.location
                ] }),
                r.product && /* @__PURE__ */ jsxs("span", { className: "mt-1.5 block text-gold", children: [
                  "\u2713 Verified purchase \u2014 ",
                  r.product
                ] })
              ] })
            ] })
          ]
        }
      ) })
    }
  );
}
function ReviewShowcase({ reviews = [] }) {
  const [active, setActive] = useState(null);
  const swiperRef = useRef(null);
  useEffect(() => {
    const ap = swiperRef.current?.autoplay;
    if (!ap) return;
    if (active) ap.stop();
    else ap.start();
  }, [active]);
  if (reviews.length === 0) return null;
  const many = reviews.length > 3;
  return /* @__PURE__ */ jsxs("section", { className: "review-coverflow py-16", children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "mx-auto mb-6 max-w-[1200px] px-5 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-rose", children: "Loved across 64 districts" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[34px] font-normal", children: "What our customers say" })
    ] }),
    /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [EffectCoverflow, Autoplay, Pagination],
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        onSwiper: (sw) => {
          swiperRef.current = sw;
        },
        loop: many,
        speed: 620,
        autoplay: { delay: 3e3, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { clickable: true },
        slidesPerView: 1.15,
        coverflowEffect: {
          rotate: 3,
          stretch: 12,
          depth: 110,
          scale: 0.92,
          modifier: 1,
          slideShadows: false
        },
        breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1440: { slidesPerView: 3.6 }
        },
        children: reviews.map((r) => /* @__PURE__ */ jsx(SwiperSlide, { className: "!h-auto px-1.5 py-5", children: /* @__PURE__ */ jsxs("figure", { role: "button", tabIndex: 0, "aria-label": `Read full review by ${r.name}`, onClick: () => setActive(r), onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActive(r);
          }
        }, className: "review-card flex h-full cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-cream transition-all duration-300", children: [
          /* @__PURE__ */ jsx(ReviewMedia, { r }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-6", children: [
            /* @__PURE__ */ jsx(StarRating, { value: r.rating }),
            /* @__PURE__ */ jsxs("blockquote", { className: "my-3.5 line-clamp-4 flex-1 text-[14.5px] leading-relaxed", children: [
              "\u201C",
              r.text,
              "\u201D"
            ] }),
            /* @__PURE__ */ jsxs("figcaption", { className: "text-[13px] text-ink-soft", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: r.name }),
              r.location && /* @__PURE__ */ jsxs(Fragment, { children: [
                " \xB7 ",
                r.location
              ] }),
              r.product && /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-gold", children: [
                "\u2713 Verified purchase \u2014 ",
                r.product
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 text-[12px] font-medium text-rose", children: "Read full review \u2192" })
          ] })
        ] }) }, r.id))
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        .review-coverflow .swiper {
          padding: 8px 0 52px;
        }
        /* NO blur or dimming on side slides \u2014 everything stays crisp */
        .review-coverflow .swiper-slide {
          height: auto;
          display: flex;
        }
        /* hero-style rose halo around the centre (active) card */
        .review-coverflow .swiper-slide-active .review-card {
          border-color: rgba(183, 110, 121, 0.5);
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 0.9),
            0 0 26px 2px rgba(214, 90, 122, 0.6),
            0 0 68px 14px rgba(199, 74, 108, 0.38),
            0 24px 70px rgba(126, 44, 64, 0.28);
        }
        /* rose halo around any card on hover */
        .review-coverflow .review-card:hover {
          transform: translateY(-4px);
          border-color: rgba(183, 110, 121, 0.45);
          box-shadow:
            0 0 0 1.5px rgba(255, 255, 255, 0.9),
            0 0 22px 2px rgba(214, 90, 122, 0.35),
            0 18px 44px rgba(126, 44, 64, 0.18);
        }
        .review-coverflow .swiper-pagination {
          bottom: 12px !important;
        }
        .review-coverflow .swiper-pagination-bullet {
          background: var(--rose);
          opacity: 0.35;
          transition: all 0.3s ease;
        }
        .review-coverflow .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px;
          border-radius: 999px;
        }
      ` }),
    active && /* @__PURE__ */ jsx(ReviewLightbox, { r: active, onClose: () => setActive(null) })
  ] });
}
export {
  ReviewShowcase as default
};