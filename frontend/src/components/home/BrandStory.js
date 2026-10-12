import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/Link.js";
import { useSettings } from "@/context/SettingsContext.js";
import { cx } from "@/lib/utils.js";
const WORDS = ["pretty", "glowing", "radiant", "confident", "soft", "you"];
function BrandStory() {
  const { branding } = useSettings();
  const [word, setWord] = useState(0);
  const [shown, setShown] = useState(false);
  const sectionRef = useRef(null);
  const parallaxRef = useRef(null);
  useEffect(() => {
    const t = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = sectionRef.current;
    const layer = parallaxRef.current;
    if (!el || !layer) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layer.style.transform = `translate(${x * 22}px, ${y * 16}px)`;
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: sectionRef,
      className: "relative overflow-hidden border-y border-line bg-pink-soft",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: parallaxRef,
            "aria-hidden": true,
            className: "pointer-events-none absolute inset-0 transition-transform duration-500 ease-out",
            children: ["8%", "22%", "72%", "88%", "50%"].map((left, i) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute animate-floaty text-2xl text-rose/30 sm:text-3xl",
                style: {
                  left,
                  top: `${14 + i * 23 % 60}%`,
                  animationDelay: `${i * 0.9}s`,
                  animationDuration: `${5 + i}s`
                },
                children: "\u273F"
              },
              i
            ))
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-28", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: cx(
                "transition-all duration-700",
                shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              ),
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.3em] text-rose", children: branding.name }),
                /* @__PURE__ */ jsxs("h2", { className: "mt-5 font-serif text-[clamp(30px,5.4vw,52px)] font-normal leading-[1.18]", children: [
                  "we wanna make you",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "relative inline-block h-[1.25em] w-[4.6em] overflow-hidden align-bottom text-left", children: WORDS.map((w, i) => /* @__PURE__ */ jsx(
                    "em",
                    {
                      className: cx(
                        "absolute left-0 text-rose transition-all duration-500 ease-out",
                        i === word ? "translate-y-0 opacity-100" : i === (word + WORDS.length - 1) % WORDS.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
                      ),
                      children: w
                    },
                    w
                  )) })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: cx(
                "mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] text-ink-soft transition-all delay-200 duration-700",
                shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              ),
              children: branding.story || "We formulate in small batches for the realities of life in Bangladesh: heat, humidity, sun, and city air. No harsh actives, no false promises \u2014 just you, made a little prettier every day."
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cx(
                "mt-9 transition-all delay-300 duration-700",
                shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              ),
              children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: "/shop",
                  className: "group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-lift",
                  children: [
                    "Begin your ritual",
                    /* @__PURE__ */ jsx("span", { className: "transition-transform duration-300 group-hover:translate-x-1", children: "\u2192" })
                  ]
                }
              )
            }
          )
        ] })
      ]
    }
  );
}
export {
  BrandStory as default
};
