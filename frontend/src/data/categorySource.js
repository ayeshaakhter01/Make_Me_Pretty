const CATEGORIES = [
  {
    name: "Skincare",
    blurb: "Cleanse, treat & protect",
    types: [
      "Cleanser",
      "Toner",
      "Serum",
      "Moisturizer",
      "Sunscreen",
      "Face Mask",
      "Essence"
    ],
    featured: { title: "Barrier heroes", copy: "Ceramide-rich formulas for humid days." }
  },
  {
    name: "Body Care",
    blurb: "Head-to-toe softness",
    types: ["Body Wash", "Body Lotion", "Body Scrub", "Hand Cream"],
    featured: { title: "Silk skin", copy: "Nourishing washes & butters." }
  },
  {
    name: "Hair Care",
    blurb: "Scalp-first rituals",
    types: ["Shampoo", "Conditioner", "Hair Oil", "Hair Mask"],
    featured: { title: "Root to tip", copy: "Gentle cleansing & deep repair." }
  },
  {
    name: "Makeup",
    blurb: "Skin-loving colour",
    types: ["Lip", "Face", "Cheeks", "Eyes"],
    featured: { title: "Your-skin-but-better", copy: "Buildable, breathable colour." }
  }
];
const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
const getTypesForCategory = (name) => CATEGORIES.find((c) => c.name === name)?.types ?? [];
export {
  CATEGORIES,
  CATEGORY_NAMES,
  getTypesForCategory
};
