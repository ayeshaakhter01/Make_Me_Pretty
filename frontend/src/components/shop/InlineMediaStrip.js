import { jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils.js";
function InlineMediaStrip({ strip }) {
  const ref = useRef(null);
  const mediaRef = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = ref.current;
    const media = mediaRef.current;
    if (!el || !media) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        media.style.transform = `translateY(${progress * 26}px) scale(1.12)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    /* full-bleed: break out of the padded grid container to span the whole
       viewport width (edge to edge). */
    /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: "relative left-1/2 my-10 w-screen -translate-x-1/2",
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: cx(
              "overflow-hidden transition-all duration-1000 ease-out",
              shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            ),
            children: /* @__PURE__ */ jsx("div", { className: "relative h-[200px] overflow-hidden sm:h-[320px] lg:h-[420px]", children: strip.mediaType === "video" ? /* @__PURE__ */ jsx(
              "video",
              {
                ref: mediaRef,
                src: strip.media,
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
                className: "absolute inset-0 h-full w-full object-cover will-change-transform"
              }
            ) : /* @__PURE__ */ jsx(
              "img",
              {
                ref: mediaRef,
                src: strip.media,
                alt: "",
                className: "absolute inset-0 h-full w-full object-cover will-change-transform"
              }
            ) })
          }
        )
      }
    )
  );
}
export {
  InlineMediaStrip as default
};
