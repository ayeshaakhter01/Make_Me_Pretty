import { jsx, jsxs } from "react/jsx-runtime";
function IngredientTags({ ingredients = [] }) {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ingredients.map((ing) => /* @__PURE__ */ jsxs(
    "span",
    {
      className: "rounded-full border border-line bg-cream px-4 py-2 text-[13px]",
      children: [
        "\u273F ",
        ing
      ]
    },
    ing
  )) });
}
export {
  IngredientTags as default
};
