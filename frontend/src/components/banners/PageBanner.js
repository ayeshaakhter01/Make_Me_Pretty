import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@/components/ui/Link.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
function Media({ b }) {
  const cls = "w-full h-auto max-h-[42vh] object-cover object-center";
  return b.mediaType === "video" ? /* @__PURE__ */ jsx("video", { src: b.media, autoPlay: true, muted: true, loop: true, playsInline: true, className: cls }) : /* @__PURE__ */ jsx("img", { src: b.media, alt: "", className: cls });
}
function Frame({ b, children }) {
  const cls = "block w-full overflow-hidden";
  return b.href ? /* @__PURE__ */ jsx(Link, { href: b.href, className: cls, children }) : /* @__PURE__ */ jsx("div", { className: cls, children });
}
function PageBanner({ banners = [] }) {
  if (banners.length === 0) return null;
  if (banners.length === 1) {
    const b = banners[0];
    return /* @__PURE__ */ jsx("section", { className: "page-banner w-full animate-fadeup", children: /* @__PURE__ */ jsx(Frame, { b, children: /* @__PURE__ */ jsx(Media, { b }) }) });
  }
  return /* @__PURE__ */ jsxs("section", { className: "page-banner w-full animate-fadeup", children: [
    /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [Autoplay, EffectFade, Pagination],
        effect: "fade",
        loop: true,
        speed: 900,
        autoplay: { delay: 4500, disableOnInteraction: false },
        pagination: { clickable: true },
        children: banners.map((b) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(Frame, { b, children: /* @__PURE__ */ jsx(Media, { b }) }) }, b.id))
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        .page-banner .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.55;
        }
        .page-banner .swiper-pagination-bullet-active {
          background: var(--rose);
          opacity: 1;
        }
      ` })
  ] });
}
export {
  PageBanner as default
};
