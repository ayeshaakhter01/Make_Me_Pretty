import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useToast } from "@/context/ToastContext.js";
import { SOCIAL_URLS_DEFAULT } from "@/data/footer.js";

// Business details (from the printed business card). Edit here only.
const INFO = {
  owner: "Ayesha",
  role: "Owner & Founder",
  phone: "01644611916",
  whatsapp: "01622736644",
  address: "Block-G, Halishahar, Chittagong",
  facebook: "https://www.facebook.com/makemepretty24",
  instagram: "https://www.instagram.com/makemepretty24"
};
const waNumber = "88" + INFO.whatsapp; // Bangladesh country code
const social = {
  facebook: INFO.facebook || SOCIAL_URLS_DEFAULT.facebook,
  instagram: INFO.instagram || SOCIAL_URLS_DEFAULT.instagram
};

const ICONS = {
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  chat: "M4 5h16v11H9l-5 4V5z",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  facebook: "M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z",
  instagram: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5h.01"
};
function Icon({ name }) {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: ICONS[name] }) });
}
function Row({ icon, label, value, href }) {
  const inner = /* @__PURE__ */ jsxs("div", { className: "group flex items-center gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-cream text-rose transition-colors group-hover:border-rose group-hover:bg-pink-soft", children: /* @__PURE__ */ jsx(Icon, { name: icon }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-ink-soft", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-[15px] font-medium text-ink", children: value })
    ] })
  ] });
  return href ? /* @__PURE__ */ jsx("a", { href, target: href.startsWith("http") ? "_blank" : void 0, rel: "noreferrer", children: inner }) : inner;
}
const FIELD = "w-full rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-rose";

function Contact({ title = "Contact" }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      showToast("Please add your name and a message");
      return;
    }
    // No backend endpoint needed: the message opens in WhatsApp, ready to send.
    const text = `Hi Make Me Pretty! I'm ${form.name.trim()}${form.phone.trim() ? ` (${form.phone.trim()})` : ""}.\n\n${form.message.trim()}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setForm({ name: "", phone: "", message: "" });
    showToast("Opening WhatsApp…");
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1100px] px-4 py-14 sm:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-10 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-[clamp(30px,4.5vw,42px)] font-normal", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-[14px] text-ink-soft", children: "Questions about an order or a product? We’d love to hear from you." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 rounded-[28px] border border-line bg-cream/90 p-6 shadow-menu backdrop-blur sm:p-10 md:grid-cols-2 md:gap-12", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-2xl", children: "Let’s connect!" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[14px] leading-relaxed text-ink-soft", children: [
          "Reach ", INFO.owner, ", ", INFO.role.toLowerCase(), ", directly or send us a message — we usually reply within a day."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-7 space-y-5", children: [
          /* @__PURE__ */ jsx(Row, { icon: "phone", label: "Call", value: INFO.phone, href: `tel:${INFO.phone}` }),
          /* @__PURE__ */ jsx(Row, { icon: "chat", label: "WhatsApp", value: INFO.whatsapp, href: `https://wa.me/${waNumber}` }),
          /* @__PURE__ */ jsx(Row, { icon: "pin", label: "Location", value: INFO.address })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-[0.14em] text-ink-soft", children: "Follow us" }),
          ["facebook", "instagram"].map((k) => /* @__PURE__ */ jsx("a", { href: social[k], target: "_blank", rel: "noreferrer", "aria-label": k, className: "flex h-10 w-10 items-center justify-center rounded-full border border-line text-rose transition-colors hover:border-rose hover:bg-pink-soft", children: /* @__PURE__ */ jsx(Icon, { name: k }) }, k))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose", children: "Your name" }),
          /* @__PURE__ */ jsx("input", { className: FIELD, value: form.name, onChange: set("name"), placeholder: "Your name" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose", children: "Phone (optional)" }),
          /* @__PURE__ */ jsx("input", { className: FIELD, value: form.phone, onChange: set("phone"), placeholder: "01XXXXXXXXX", inputMode: "tel" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-rose", children: "Message" }),
          /* @__PURE__ */ jsx("textarea", { className: FIELD + " min-h-[130px] resize-y", value: form.message, onChange: set("message"), placeholder: "Write your message here…" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full rounded-full bg-rose px-7 py-3.5 text-sm font-medium tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 hover:bg-rose-deep hover:shadow-rose active:scale-[0.97]", children: "Send Message" })
      ] })
    ] })
  ] });
}
export {
  Contact as default
};