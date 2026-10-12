import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import CouponCard from "@/components/promo/CouponCard.js";
import { useSettings } from "@/context/SettingsContext.js";
import { cx } from "@/lib/utils.js";
const SEEN_KEY = "mmp_welcome_seen";
function WelcomePromo({ coupons = [] }) {
  const { branding } = useSettings();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const announcement = coupons.find((c) => c.kind === "announcement");
  const featured = coupons.filter((c) => c.kind === "coupon" && c.featured);
  const slides = [announcement, ...featured].filter(Boolean);
  useEffect(() => {
    if (slides.length === 0) return;
    if (sessionStorage.getItem(SEEN_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [slides.length]);
  useEffect(() => {
    if (!open || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3800);
    return () => clearInterval(t);
  }, [open, slides.length]);
  const close = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };
  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length);
  if (!open || slides.length === 0) return null;
  const current = slides[Math.min(index, slides.length - 1)];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-[190] flex items-start justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm sm:items-center",
      onClick: close,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          role: "dialog",
          "aria-label": "Welcome offers",
          onClick: (e) => e.stopPropagation(),
          className: "relative my-6 w-full max-w-md animate-fadeup rounded-3xl border border-line bg-ivory shadow-menu",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: close,
                "aria-label": "Close",
                className: "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-lg text-ink-soft backdrop-blur transition-colors hover:text-ink",
                children: "\xD7"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 pt-7", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-rose", children: [
                  "Welcome to ",
                  branding.name
                ] }),
                /* @__PURE__ */ jsxs("h2", { className: "mt-1 font-serif text-[26px] leading-tight", children: [
                  branding.tagline || "we wanna make you pretty",
                  " \u273F"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative mt-5", children: [
                /* @__PURE__ */ jsx(CouponCard, { coupon: current, onNavigate: close, className: "animate-fadeup" }, current.id),
                slides.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => go(-1),
                      "aria-label": "Previous offer",
                      className: "absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-ink shadow-soft backdrop-blur transition-colors hover:bg-white",
                      children: "\u2039"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => go(1),
                      "aria-label": "Next offer",
                      className: "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-ink shadow-soft backdrop-blur transition-colors hover:bg-white",
                      children: "\u203A"
                    }
                  )
                ] })
              ] }),
              slides.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center gap-1.5", children: slides.map((s, i) => /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": `Offer ${i + 1}`,
                  onClick: () => setIndex(i),
                  className: cx(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-rose" : "w-1.5 bg-line"
                  )
                },
                s.id
              )) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: close,
                  className: "mt-4 block w-full text-center text-[12.5px] text-ink-soft underline",
                  children: "Continue to the shop"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
export {
  WelcomePromo as default
};
