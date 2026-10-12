import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { SOCIAL_PLATFORMS, SOCIAL_LABELS } from "@/data/footer.js";
const ICONS = {
  facebook: /* @__PURE__ */ jsx("path", { d: "M13.5 21v-7h2.3l.4-2.7h-2.7V9.5c0-.8.2-1.3 1.4-1.3H16V5.8c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v1.9H8.2V14h2.4v7h2.9z" }),
  instagram: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "4.5", fill: "none", stroke: "currentColor", strokeWidth: "1.7" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3.8", fill: "none", stroke: "currentColor", strokeWidth: "1.7" }),
    /* @__PURE__ */ jsx("circle", { cx: "16.6", cy: "7.4", r: "1.1" })
  ] }),
  tiktok: /* @__PURE__ */ jsx("path", { d: "M15 4c.3 1.9 1.4 3.2 3.3 3.4v2.3c-1.1.1-2.1-.2-3.2-.8v4.7c0 3-2.2 5.1-5 5.1-2.6 0-4.5-2-4.5-4.5 0-2.7 2.3-4.7 5.2-4.3v2.5c-.4-.1-.8-.2-1.2-.1-1 .1-1.7.8-1.7 1.9 0 1.1.9 2 2 2 1.2 0 2-.9 2-2.3V4H15z" }),
  whatsapp: /* @__PURE__ */ jsx("path", { d: "M12 3.6a8.3 8.3 0 00-7 12.7L4 20.4l4.2-1a8.3 8.3 0 103.8-15.8zm0 1.7a6.6 6.6 0 015.6 10 6.6 6.6 0 01-8.6 2.3l-.3-.2-2.5.6.6-2.4-.2-.3A6.6 6.6 0 0112 5.3zm-2.4 3c-.2 0-.4 0-.6.3-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.2 1.4 2.3 3.6 3.1 1.8.7 2.2.6 2.6.5.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1l-.6-.3s-.9-.4-1-.5c-.2 0-.3-.1-.5.1l-.6.8c-.1.1-.2.2-.4.1-.2-.1-.9-.4-1.7-1-.6-.6-1-1.2-1.2-1.4-.1-.2 0-.3.1-.4l.3-.4.2-.4v-.3l-.6-1.5c-.2-.4-.3-.3-.5-.3z" }),
  linkedin: /* @__PURE__ */ jsx("path", { d: "M6.9 8.5H4.3V20h2.6V8.5zM5.6 4.3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM20 20v-6.3c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.6V8.5h-2.6c0 .7 0 11.5 0 11.5h2.6v-6.4c0-.3 0-.7.1-.9.3-.7.9-1.4 1.9-1.4 1.3 0 1.9 1 1.9 2.5V20H20z" }),
  youtube: /* @__PURE__ */ jsx("path", { d: "M21.6 8.2a2.5 2.5 0 00-1.8-1.8C18.2 6 12 6 12 6s-6.2 0-7.8.4A2.5 2.5 0 002.4 8.2 26 26 0 002 12a26 26 0 00.4 3.8 2.5 2.5 0 001.8 1.8C5.8 18 12 18 12 18s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-3.8zM10 15V9l5.2 3-5.2 3z" }),
  twitter: /* @__PURE__ */ jsx("path", { d: "M17.5 4h2.9l-6.3 7.2L21.5 20h-5.6l-4.4-5.7L6.5 20H3.6l6.7-7.7L3 4h5.7l4 5.3L17.5 4zm-1 14.3h1.6L8.1 5.6H6.4l10.1 12.7z" })
};
function SocialIcons({ social = {} }) {
  const items = SOCIAL_PLATFORMS.filter((p) => social[p.key] && ICONS[p.key]);
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2.5", children: items.map((p) => /* @__PURE__ */ jsx(
    "a",
    {
      href: social[p.key],
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": SOCIAL_LABELS[p.key] || p.key,
      className: "flex h-9 w-9 items-center justify-center rounded-full border border-[#5A4F49] text-ivory transition-colors hover:border-rose hover:bg-rose hover:text-white",
      children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-[18px] w-[18px]", fill: "currentColor", children: ICONS[p.key] })
    },
    p.key
  )) });
}
export {
  SocialIcons as default
};
