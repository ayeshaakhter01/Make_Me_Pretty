import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";

/* =============================================================================
   NEW HERO — 3D swiping cards with pictures and videos (by Fayeza)

   HOW IT WORKS
   - SLIDES (below) is the list of cards. Each card is a picture or a video.
   - <Swiper> is a ready-made slider library. We switch on its "coverflow"
     effect (the 3D look: side cards tilt back, centre card is big) and
     "autoplay" (it swipes by itself).
   - The centre card gets a soft pink glow. The video only plays on the
     centre card.

   HOW TO CHANGE IT: only edit the SLIDES list.
     type     = "image" or "video"
     src      = file inside the  frontend/media/hero  folder
     title    = big text on the card (can be "")
     subtitle = small text under the title (can be "")
     href     = where the card goes when clicked ("/shop", "/makeup" ...)
   If a file is missing, the card shows a pink background instead.
============================================================================= */
const SLIDES = [
  { type: "video", src: "media/hero/MPM.mp4", title: "", subtitle: "", href: "/shop" },
  { type: "image", src: "media/hero/brand.png", title: "Glow, delivered", subtitle: "Skincare you will love", href: "/shop" },
  { type: "image", src: "media/hero/photo2.jpg", title: "New in Makeup", subtitle: "Colour for every mood", href: "/makeup" },
  { type: "image", src: "media/hero/offers.png", title: "Glow for less", subtitle: "Our favourite skincare at special prices", button: "Shop offers", href: "/offers" },
];

/* play the video only on the centre card, pause the others */
function syncVideos(swiper) {
  swiper.slides.forEach((slide) => {
    const v = slide.querySelector("video");
    if (!v) return;
    if (slide.classList.contains("swiper-slide-active")) {
      const p = v.play();
      if (p) p.catch(() => {});
    } else if (!v.paused) {
      v.pause();
    }
  });
}

/* if a picture/video file is missing, just hide it (pink background shows) */
const hideBroken = (e) => {
  e.currentTarget.style.display = "none";
};

function HeroSection() {
  return /* @__PURE__ */ jsxs("section", {
    className: "hero3d relative w-full",
    children: [
      /* @__PURE__ */ jsx(Swiper, {
        modules: [EffectCoverflow, Autoplay, Pagination],
        effect: "coverflow", // the 3D look
        grabCursor: true, // hand cursor, you can drag the cards
        centeredSlides: true, // the active card sits in the middle
        loop: true, // after the last card it starts again
        speed: 1100, // how long the swipe animation takes (ms)
        autoplay: { delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { clickable: true }, // the dots at the bottom
        slidesPerView: 1.18, // 1 big card + a peek of the side cards
        coverflowEffect: { rotate: 4, stretch: "20%", depth: 200, scale: 0.9, modifier: 1, slideShadows: false },
        onSwiper: syncVideos,
        onSlideChangeTransitionEnd: syncVideos,
        children: SLIDES.map((s, i) =>
          /* @__PURE__ */ jsx(
            SwiperSlide,
            {
              children: /* @__PURE__ */ jsxs(Link, {
                href: s.href,
                className: "hero3d-card",
                children: [
                  s.type === "video"
                    ? /* @__PURE__ */ jsx("video", {
                        src: s.src,
                        muted: true,
                        loop: true,
                        playsInline: true,
                        preload: "metadata",
                        onError: hideBroken,
                        className: "hero3d-media",
                      })
                    : /* @__PURE__ */ jsx("img", {
                        src: s.src,
                        alt: s.title || "Make Me Pretty",
                        onError: hideBroken,
                        className: "hero3d-media",
                      }),
                  (s.title || s.subtitle) &&
                    /* @__PURE__ */ jsxs("div", {
                      className: "hero3d-text",
                      children: [
                        s.title && /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl leading-tight text-white sm:text-4xl", children: s.title }),
                        s.subtitle && /* @__PURE__ */ jsx("p", { className: "mt-1.5 max-w-md text-[13px] text-white/90 sm:text-[15px]", children: s.subtitle }),
                      ],
                    }),
                ],
              }),
            },
            i
          )
        ),
      }),
      /* the CSS for this hero (kept here so everything is in one file) */
      /* @__PURE__ */ jsx("style", {
        children: `
        .hero3d .swiper { padding: 8px 0 44px; perspective: 1400px; }

        /* side cards are faded + slightly blurred, the centre card is sharp */
        .hero3d .swiper-slide {
          display: flex; align-items: center; justify-content: center;
          transition: opacity 1.1s ease-in-out, filter 1.1s ease-in-out;
          filter: blur(1.4px) brightness(0.96);
          opacity: 0.35;
        }
        .hero3d .swiper-slide-active { filter: none; opacity: 1; }

        /* one card: size, pink background (shown if the file is missing) */
        .hero3d-card {
          position: relative; display: block; width: 100%; overflow: hidden;
          height: clamp(240px, 62vh, 700px);
          background: linear-gradient(135deg, #F6DEE3, #E8C4CB);
          transition: box-shadow 1.1s ease-in-out;
        }
        /* pink glow around the centre card */
        .hero3d .swiper-slide-active .hero3d-card {
          box-shadow: 0 0 30px 4px rgba(214,90,122,0.5),
                      0 0 80px 18px rgba(199,74,108,0.34),
                      0 24px 70px rgba(126,44,64,0.3);
        }
        .hero3d-media { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* title + subtitle at the bottom of a card, on a soft dark fade */
        .hero3d-text {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; padding: 24px 28px;
          background: linear-gradient(to top, rgba(59,48,44,0.55), transparent 55%);
        }

        /* dots */
        .hero3d .swiper-pagination { bottom: 14px !important; }
        .hero3d .swiper-pagination-bullet { background: var(--rose); opacity: 0.35; transition: all 0.3s ease; }
        .hero3d .swiper-pagination-bullet-active { opacity: 1; width: 24px; border-radius: 999px; }
      `,
      }),
    ],
  });
}
export {
  HeroSection as default
};
