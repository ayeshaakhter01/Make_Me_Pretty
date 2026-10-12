import { jsx, jsxs } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { CONTENT_SLUGS, CONTENT_PAGES } from "@/data/footer.js";
import AboutUs from "@/components/pages/AboutUs.js";
import Contact from "@/components/pages/Contact.js";
import { useApi } from "@/lib/hooks.js";
import { useSettings } from "@/context/SettingsContext.js";
import { useTitle } from "@/lib/useTitle.js";
import NotFound from "@/pages/NotFound.js";
function ContentPage() {
  const { slug } = useParams();
  const valid = CONTENT_SLUGS.includes(slug);
  const { branding } = useSettings();
  const { data: settings, loading } = useApi(valid ? "/api/settings" : null, (d) => d.settings || {}, {});
  const { data: people } = useApi(slug === "about-us" ? "/api/about" : null, (d) => d.people || [], []);
  const page = settings?.contentPages?.[slug] || {};
  const fallback = CONTENT_PAGES.find((p) => p.slug === slug);
  const title = page.title || fallback?.title || "Page";
  useTitle(valid ? title : "Page not found");
  if (!valid) return /* @__PURE__ */ jsx(NotFound, {});
  if (slug === "about-us") {
    return /* @__PURE__ */ jsx(AboutUs, { people, brandName: branding.name, title });
  }
  if (slug === "contact") return /* @__PURE__ */ jsx(Contact, { title });
  const body = (page.body || "").trim();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[760px] px-5 py-14", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-serif text-[clamp(28px,4.5vw,40px)] font-normal", children: title }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: body ? /* @__PURE__ */ jsx("div", { className: "whitespace-pre-line text-[15px] leading-relaxed text-ink-soft", children: body }) : loading ? /* @__PURE__ */ jsx("div", { className: "h-24 skel rounded-lg" }) : /* @__PURE__ */ jsx("p", { className: "text-[15px] text-ink-soft", children: "This page is coming soon. Please check back shortly." }) })
  ] });
}
export {
  ContentPage as default
};