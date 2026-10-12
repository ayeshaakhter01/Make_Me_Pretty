import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import CouponCard from "@/components/promo/CouponCard.js";
import { cx } from "@/lib/utils.js";
function message(c) {
  if (c.text && c.text.trim()) return c.text;
  if (c.type === "shipping") return "Free delivery";
  return `${c.value}% off your order`;
}
function OffersBar({ coupons = [] }) {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const [openCard, setOpenCard] = useState(false);
  const rootRef = useRef(null);
  const key = useMemo(() => coupons.map((c) => c.id).join("|"), [coupons]);
  useEffect(() => {
    setDismissed(sessionStorage.getItem("mmp_offer_dismissed") === key);
    setIndex(0);
  }, [key]);
  useEffect(() => {
    if (coupons.length <= 1 || openCard) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % coupons.length), 4200);
    return () => clearInterval(t);
  }, [coupons.length, openCard]);
  useEffect(() => {
    if (!openCard) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenCard(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openCard]);
  if (coupons.length === 0 || dismissed) return null;
  const current = coupons[index] || coupons[0];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      className: "relative z-[95] bg-gradient-to-r from-rose via-rose-deep to-rose text-white",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-10 py-2 text-center text-[12.5px] tracking-[0.06em]", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setOpenCard((o) => !o),
              className: "flex items-center gap-2.5 transition-opacity hover:opacity-90",
              "aria-expanded": openCard,
              children: [
                /* @__PURE__ */ jsx("span", { className: "animate-fadeup font-medium", children: message(current) }, current.id),
                current.kind === "coupon" && current.code && /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-white/40 bg-white/10 px-3 py-0.5 text-[11px] font-semibold tracking-[0.12em]", children: [
                  "CODE: ",
                  current.code
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-white/70", children: openCard ? "\u25B2" : "\u25BC" })
              ]
            }
          ),
          coupons.length > 1 && /* @__PURE__ */ jsx("span", { className: "ml-1 hidden items-center gap-1 sm:flex", children: coupons.map((c, i) => /* @__PURE__ */ jsx(
            "button",
            {
              "aria-label": `Offer ${i + 1}`,
              onClick: () => {
                setIndex(i);
                setOpenCard(true);
              },
              className: cx(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === index ? "bg-white" : "bg-white/40"
              )
            },
            c.id
          )) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Dismiss offers",
            onClick: () => {
              setDismissed(true);
              sessionStorage.setItem("mmp_offer_dismissed", key);
            },
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/80 transition-colors hover:text-white",
            children: "\xD7"
          }
        ),
        openCard && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[180] flex items-start justify-center overflow-y-auto p-4 sm:items-center", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              "aria-label": "Close offers",
              onClick: () => setOpenCard(false),
              className: "absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative my-4 w-full max-w-[920px] rounded-2xl border border-line bg-ivory p-4 shadow-menu animate-fadeup sm:p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between px-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft", children: "Current offers" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Close offers",
                  onClick: () => setOpenCard(false),
                  className: "flex h-8 w-8 items-center justify-center rounded-full text-xl text-ink-soft transition-colors hover:bg-pink-soft hover:text-ink",
                  children: "\xD7"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: coupons.map((c) => /* @__PURE__ */ jsx(
              CouponCard,
              {
                coupon: c,
                onNavigate: () => setOpenCard(false)
              },
              c.id
            )) })
          ] })
        ] })
      ]
    }
  );
}
export {
  OffersBar as default
};
