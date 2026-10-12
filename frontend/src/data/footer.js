const HELP_PAGES = [
  { slug: "contact", label: "Contact", title: "Contact" },
  { slug: "about-us", label: "About Us", title: "The People Behind Make Me Pretty" }
];
const POLICY_PAGES = [
  { slug: "refund-return", label: "Refund & Return Policy", title: "Refund & Return Policy" },
  { slug: "privacy", label: "Privacy Policy", title: "Privacy Policy" },
  { slug: "delivery", label: "Delivery Policy", title: "Delivery Policy" },
  { slug: "terms", label: "Terms & Condition", title: "Terms & Condition" }
];
const CONTENT_PAGES = [...HELP_PAGES, ...POLICY_PAGES];
const CONTENT_SLUGS = CONTENT_PAGES.map((p) => p.slug);
const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X (Twitter)" }
];
const SOCIAL_KEYS = SOCIAL_PLATFORMS.map((p) => p.key);
const SOCIAL_LABELS = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p.label])
);
const SOCIAL_URLS_DEFAULT = {
  facebook: "https://www.facebook.com/share/1GzwwLRMqB/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/makemepretty24?igsh=bmF3MXowbGR4MmY=",
  tiktok: "https://www.tiktok.com/@make_me_pretty9?_r=1&_t=ZS-97weg3uXdzR",
  linkedin: "https://www.linkedin.com/in/make-me-pretty-773652376?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
};
export {
  CONTENT_PAGES,
  CONTENT_SLUGS,
  HELP_PAGES,
  POLICY_PAGES,
  SOCIAL_KEYS,
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  SOCIAL_URLS_DEFAULT
};
