import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import HeroSection from "@/components/hero/HeroSection.js";
import TrustMarquee from "@/components/home/TrustMarquee.js";
import CategoryShowcase from "@/components/home/CategoryShowcase.js";
import FeaturedProducts from "@/components/home/FeaturedProducts.js";
import BrandShowcase from "@/components/home/BrandShowcase.js";
import BlogSection from "@/components/home/BlogSection.js";
import BrandStory from "@/components/home/BrandStory.js";
import ReviewShowcase from "@/components/home/ReviewShowcase.js";
import ShareYourGlow from "@/components/home/ShareYourGlow.js";
import { useApi } from "@/lib/hooks.js";
import { useSettings } from "@/context/SettingsContext.js";
import { useTitle } from "@/lib/useTitle.js";
function HomePage() {
  useTitle();
  const { footer } = useSettings();
  const { data: slides } = useApi("/api/hero-slides", (d) => d.slides || [], []);
  const { data: posts } = useApi("/api/blogs", (d) => d.blogs || [], []);
  const { data: reviews } = useApi("/api/reviews", (d) => d.reviews || [], []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(HeroSection, { slides }),
    /* @__PURE__ */ jsx(TrustMarquee, {}),
    /* @__PURE__ */ jsx(CategoryShowcase, {}),
    /* @__PURE__ */ jsx(FeaturedProducts, {}),
    /* @__PURE__ */ jsx(BrandShowcase, { brands: footer.brandLogos || [] }),
    /* @__PURE__ */ jsx(BlogSection, { blogs: posts }),
    /* @__PURE__ */ jsx(BrandStory, {}),
    /* @__PURE__ */ jsx(ReviewShowcase, { reviews }),
    /* @__PURE__ */ jsx(ShareYourGlow, {})
  ] });
}
export {
  HomePage as default
};
