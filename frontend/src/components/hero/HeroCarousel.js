import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
function HeroCarousel({ slides = [] }) {
  if (slides.length === 0) return null;
  const many = slides.length > 2;
  const syncVideos = (swiper) => {
    swiper.slides.forEach((slide) => {
      const v = slide.querySelector("video");
      if (!v) return;
      if (slide.classList.contains("swiper-slide-active")) {
        const p = v.play();
        if (p) p.catch(() => {
        });
      } else if (!v.paused) {
        v.pause();
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "hero-coverflow relative w-full", children: [
    /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [EffectCoverflow, Autoplay, Pagination],
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: many,
        speed: 1100,
        autoplay: { delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { clickable: true },
        slidesPerView: 1.18,
        coverflowEffect: {
          rotate: 4,
          stretch: "20%",
          depth: 200,
          scale: 0.9,
          modifier: 1,
          slideShadows: false
        },
        onSwiper: syncVideos,
        onSlideChangeTransitionEnd: syncVideos,
        children: slides.map((s) => {
          const href = s.isOffer ? "/shop?offers=1" : s.href || "/shop";
          return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsxs(
            Link,
            {
              href,
              className: "group relative mx-auto block h-[44vh] max-h-[860px] min-h-[220px] w-full overflow-hidden shadow-lift sm:h-[60vh] lg:h-[78vh]",
              children: [
                s.mediaType === "video" ? /* @__PURE__ */ jsx(
                  "video",
                  {
                    src: s.media,
                    muted: true,
                    loop: true,
                    playsInline: true,
                    preload: "metadata",
                    className: "hero-media h-full w-full object-cover"
                  }
                ) : /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: s.media,
                    alt: s.title || "Banner",
                    className: "hero-media h-full w-full object-cover"
                  }
                ),
                (s.title || s.subtitle || s.isOffer) && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/50 via-transparent to-transparent p-6 sm:p-8", children: [
                  s.isOffer && /* @__PURE__ */ jsx("span", { className: "mb-2 w-max rounded-full bg-gold-soft px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8A6A2F]", children: "\u2726 Offer" }),
                  s.title && /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl leading-tight text-white drop-shadow-sm sm:text-4xl", children: s.title }),
                  s.subtitle && /* @__PURE__ */ jsx("p", { className: "mt-1.5 max-w-md text-[13px] text-white/85 sm:text-[15px]", children: s.subtitle })
                ] })
              ]
            }
          ) }, s.id);
        })
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        .hero-coverflow .swiper {
          padding: 8px 0 44px;
          perspective: 1400px;
        }
        /* CROSS-FADE layered on top of coverflow: side cards sit dimmed + blurred
           and dissolve to full opacity as they become active (1.1s, matched to
           the Swiper speed, so the fade and the 3D move finish together). */
        .hero-coverflow .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 1.1s ease-in-out, filter 1.1s ease-in-out;
          filter: blur(1.4px) brightness(0.96) saturate(0.95);
          opacity: 0.35;
        }
        .hero-coverflow .swiper-slide-active {
          filter: none;
          opacity: 1;
        }
        /* Borderless card \u2014 soft rose bloom, no ring/outline, square corners. */
        .hero-coverflow .swiper-slide a {
          transition: box-shadow 1.1s ease-in-out;
        }
        .hero-coverflow .swiper-slide-active a {
          box-shadow:
            0 0 30px 4px rgba(214, 90, 122, 0.5),
            0 0 80px 18px rgba(199, 74, 108, 0.34),
            0 24px 70px rgba(126, 44, 64, 0.3);
        }
        /* KEN BURNS \u2014 a STILL PHOTO drifts from a slight zoom-in back out to its
           natural size, so it feels alive.

           IMPORTANT: images only, never <video>. Animating scale() on a playing
           video re-rasterises its texture at a new scale on every decoded frame,
           and here that happens inside the coverflow's 3D matrix (perspective +
           rotateY) \u2014 which made the video visibly judder. A video already has
           motion of its own, so it doesn't need Ken Burns. */
        @keyframes hero-ken-burns {
          from {
            transform: scale(1.12);
          }
          to {
            transform: scale(1);
          }
        }
        .hero-coverflow img.hero-media {
          transform: scale(1.12);
          transform-origin: center;
          /* NO will-change here: loop duplicates the slides, so this selector
             matches ~16 elements and each one would be promoted to its own
             compositor layer (~1600x800 each = tens of MB of GPU memory). Only
             the centre card \u2014 the one actually animating \u2014 gets promoted. */
          backface-visibility: hidden;
        }
        /* Duration tracks the slide's dwell (autoplay delay + fade speed) so the
           zoom finishes just as the card hands over, instead of being cut off. */
        .hero-coverflow .swiper-slide-active img.hero-media {
          animation: hero-ken-burns 3.9s ease-out both;
          will-change: transform;
        }
        /* Video: no scaling, no promotion, no animation \u2014 just let it play. */
        .hero-coverflow video.hero-media {
          transform: none;
        }
        .hero-coverflow .swiper-pagination {
          bottom: 14px !important;
        }
        .hero-coverflow .swiper-pagination-bullet {
          background: var(--rose);
          opacity: 0.35;
          transition: all 0.3s ease;
        }
        .hero-coverflow .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px;
          border-radius: 999px;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-coverflow .swiper-slide {
            transition: none;
          }
          .hero-coverflow .hero-media,
          .hero-coverflow .swiper-slide-active .hero-media {
            animation: none;
            transform: none;
          }
        }
      ` })
  ] });
}
export {
  HeroCarousel as default
};
