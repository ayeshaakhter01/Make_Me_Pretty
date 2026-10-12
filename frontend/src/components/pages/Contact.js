import { jsx, jsxs } from "react/jsx-runtime";
function Contact({ title = "Contact" }) {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[760px] px-5 py-14", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-serif text-[clamp(28px,4.5vw,40px)] font-normal", children: title })
  ] });
}
export {
  Contact as default
};
