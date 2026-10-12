import { jsx } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import Providers from "@/components/Providers.js";
import App from "@/App.js";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(HashRouter, { children: /* @__PURE__ */ jsx(Providers, { children: /* @__PURE__ */ jsx(App, {}) }) }) })
);
