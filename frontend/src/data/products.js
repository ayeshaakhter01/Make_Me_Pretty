/* =============================================================================
   Product catalog (mock data — no backend yet).
   Schema:
     id        unique string used in /product/[id]
     name      display name
     category  top-level category (Skincare | Body Care | Hair Care | Makeup)
     type      product type (matches a type inside its category)
     price     current price (BDT)
     old       original price (BDT) or null
     rating    average rating 0–5
     reviews   review count
     stock     units in stock (<=5 shows "Low stock")
     badge     "Bestseller" | "New" | null
     shape     placeholder illustration bottle shape
     c1,c2     gradient tints for the placeholder / image container
     skin      "best for" descriptor
     desc      marketing description
     ing       key ingredients
============================================================================= */

export const PRODUCTS = [
  // ---------------- Skincare ----------------
  {
    id: "1", name: "Rose Dew Cleanser", category: "Skincare", type: "Cleanser",
    price: 850, old: 990, rating: 4.8, reviews: 214, stock: 32, badge: "Bestseller",
    shape: "pump", c1: "#F6DEE3", c2: "#DBA8B1", skin: "All skin types",
    desc: "A silky gel-to-foam cleanser with Bulgarian rose water and glycerin that lifts away impurities without stripping the skin barrier.",
    ing: ["Rose Water", "Glycerin", "Panthenol", "Chamomile"],
  },
  {
    id: "2", name: "Silk Barrier Moisturizer", category: "Skincare", type: "Moisturizer",
    price: 1250, old: null, rating: 4.9, reviews: 342, stock: 27, badge: "Bestseller",
    shape: "jar", c1: "#FAEDEF", c2: "#E8C4CB", skin: "Dry · Sensitive",
    desc: "A cloud-light cream with 5 ceramides and squalane that seals in moisture for 72 hours of soft, supple skin.",
    ing: ["Ceramide NP", "Squalane", "Shea Butter", "Oat Extract"],
  },
  {
    id: "3", name: "Niacinamide 10% Serum", category: "Skincare", type: "Serum",
    price: 1450, old: null, rating: 4.7, reviews: 189, stock: 41, badge: "New",
    shape: "dropper", c1: "#F3E6EA", c2: "#C99AA5", skin: "Oily · Combination",
    desc: "A featherweight serum that visibly minimizes pores, balances oil, and evens tone in four weeks.",
    ing: ["Niacinamide 10%", "Zinc PCA", "Hyaluronic Acid"],
  },
  {
    id: "4", name: "Vitamin C Glow Drops", category: "Skincare", type: "Serum",
    price: 1650, old: 1850, rating: 4.6, reviews: 156, stock: 18, badge: null,
    shape: "dropper", c1: "#F9EBDD", c2: "#E4B98E", skin: "All skin types",
    desc: "15% stabilized vitamin C with ferulic acid for a lit-from-within glow and visibly faded dark spots.",
    ing: ["Vitamin C 15%", "Ferulic Acid", "Vitamin E"],
  },
  {
    id: "5", name: "Ceramide Night Cream", category: "Skincare", type: "Moisturizer",
    price: 1550, old: null, rating: 4.8, reviews: 98, stock: 22, badge: null,
    shape: "jar", c1: "#EFE3CE", c2: "#CBAF83", skin: "Dry · Mature",
    desc: "An overnight repair cream with peptides and ceramides that works while you sleep — wake up to plush, rested skin.",
    ing: ["Peptide Complex", "Ceramides", "Bakuchiol"],
  },
  {
    id: "6", name: "Hydra Mist Toner", category: "Skincare", type: "Toner",
    price: 950, old: null, rating: 4.5, reviews: 121, stock: 36, badge: "New",
    shape: "mist", c1: "#F0E9F2", c2: "#C3AECB", skin: "All skin types",
    desc: "A fine hydrating mist with rice water and hyaluronic acid — a burst of dew any time your skin asks for it.",
    ing: ["Rice Water", "Hyaluronic Acid", "Allantoin"],
  },
  {
    id: "7", name: "Clay Petal Face Mask", category: "Skincare", type: "Face Mask",
    price: 1100, old: null, rating: 4.7, reviews: 87, stock: 4, badge: null,
    shape: "tube", c1: "#F6DEE3", c2: "#D2939E", skin: "Oily · Combination",
    desc: "Pink kaolin clay and rose petal powder detoxify pores while keeping skin comfortably soft — never tight.",
    ing: ["Pink Kaolin", "Rose Petal", "Aloe Vera"],
  },
  {
    id: "8", name: "SPF 50 Silk Shield", category: "Skincare", type: "Sunscreen",
    price: 1350, old: null, rating: 4.9, reviews: 265, stock: 30, badge: "Bestseller",
    shape: "tube", c1: "#FBF3E4", c2: "#E6C89B", skin: "All skin types",
    desc: "An invisible, no-white-cast SPF 50 PA++++ with a silky finish that sits perfectly under makeup.",
    ing: ["UV Filters", "Centella", "Niacinamide"],
  },
  {
    id: "9", name: "Rice Glow Essence", category: "Skincare", type: "Essence",
    price: 1200, old: null, rating: 4.6, reviews: 74, stock: 25, badge: "New",
    shape: "mist", c1: "#F5EFE2", c2: "#DFC9A0", skin: "Dull · Uneven",
    desc: "A fermented rice essence that preps skin to drink in everything after — for a soft, glassy finish.",
    ing: ["Fermented Rice", "Galactomyces", "Niacinamide"],
  },

  // ---------------- Body Care ----------------
  {
    id: "10", name: "Almond Milk Body Wash", category: "Body Care", type: "Body Wash",
    price: 780, old: null, rating: 4.7, reviews: 132, stock: 40, badge: "Bestseller",
    shape: "pump", c1: "#F7EEE6", c2: "#E3C9AE", skin: "All skin types",
    desc: "A creamy, sulfate-free wash with sweet almond milk that leaves skin clean, soft and lightly scented.",
    ing: ["Almond Milk", "Glycerin", "Vitamin E"],
  },
  {
    id: "11", name: "Shea Comfort Body Lotion", category: "Body Care", type: "Body Lotion",
    price: 920, old: 1050, rating: 4.8, reviews: 156, stock: 34, badge: null,
    shape: "pump", c1: "#FAEDEF", c2: "#E8C4CB", skin: "Dry",
    desc: "A fast-absorbing body lotion with shea and mango butter for 24-hour cushiony softness.",
    ing: ["Shea Butter", "Mango Butter", "Panthenol"],
  },
  {
    id: "12", name: "Rose Sugar Body Scrub", category: "Body Care", type: "Body Scrub",
    price: 990, old: null, rating: 4.6, reviews: 61, stock: 5, badge: null,
    shape: "jar", c1: "#F6DEE3", c2: "#D2939E", skin: "All skin types",
    desc: "Fine cane sugar and rose oil buff away dullness for smooth, glowing, ready-for-summer skin.",
    ing: ["Cane Sugar", "Rose Oil", "Jojoba Oil"],
  },
  {
    id: "13", name: "Velvet Hand Cream", category: "Body Care", type: "Hand Cream",
    price: 540, old: null, rating: 4.9, reviews: 203, stock: 48, badge: "Bestseller",
    shape: "tube", c1: "#F3E6EA", c2: "#C99AA5", skin: "Dry hands",
    desc: "A non-greasy hand cream that sinks in instantly — keep one in every bag.",
    ing: ["Shea Butter", "Glycerin", "Allantoin"],
  },

  // ---------------- Hair Care ----------------
  {
    id: "14", name: "Gentle Rice Shampoo", category: "Hair Care", type: "Shampoo",
    price: 880, old: null, rating: 4.6, reviews: 118, stock: 29, badge: null,
    shape: "pump", c1: "#F5EFE2", c2: "#DFC9A0", skin: "All hair types",
    desc: "A sulfate-free rice water shampoo that gently cleanses while adding strength and shine.",
    ing: ["Rice Water", "Biotin", "Panthenol"],
  },
  {
    id: "15", name: "Silk Slip Conditioner", category: "Hair Care", type: "Conditioner",
    price: 920, old: null, rating: 4.7, reviews: 96, stock: 31, badge: "New",
    shape: "pump", c1: "#FAEDEF", c2: "#E8C4CB", skin: "Dry · Frizzy",
    desc: "A slip-rich conditioner that detangles and smooths without weighing hair down.",
    ing: ["Cationic Guar", "Argan Oil", "Silk Protein"],
  },
  {
    id: "16", name: "Amla Root Hair Oil", category: "Hair Care", type: "Hair Oil",
    price: 760, old: 890, rating: 4.8, reviews: 174, stock: 26, badge: "Bestseller",
    shape: "dropper", c1: "#EFE3CE", c2: "#CBAF83", skin: "Thinning · Dry",
    desc: "A lightweight pre-wash oil with amla and bhringraj to nourish the scalp and strengthen roots.",
    ing: ["Amla", "Bhringraj", "Coconut Oil"],
  },
  {
    id: "17", name: "Deep Repair Hair Mask", category: "Hair Care", type: "Hair Mask",
    price: 1150, old: null, rating: 4.7, reviews: 58, stock: 19, badge: null,
    shape: "jar", c1: "#F7EEE6", c2: "#E3C9AE", skin: "Damaged",
    desc: "A weekly deep-repair mask with keratin and shea that revives dry, over-processed ends.",
    ing: ["Keratin", "Shea Butter", "Argan Oil"],
  },

  // ---------------- Makeup ----------------
  {
    id: "18", name: "Petal Tint Lip Balm", category: "Makeup", type: "Lip",
    price: 650, old: null, rating: 4.8, reviews: 221, stock: 44, badge: "Bestseller",
    shape: "tube", c1: "#F6DEE3", c2: "#D2939E", skin: "All skin tones",
    desc: "A sheer, buildable lip tint with a hydrating balm base for a soft, bitten-berry flush.",
    ing: ["Shea Butter", "Jojoba Oil", "Fruit Pigments"],
  },
  {
    id: "19", name: "Skin Veil Tinted Serum", category: "Makeup", type: "Face",
    price: 1450, old: 1650, rating: 4.6, reviews: 89, stock: 17, badge: "New",
    shape: "dropper", c1: "#F9EBDD", c2: "#E4B98E", skin: "All skin tones",
    desc: "A skincare-makeup hybrid that evens tone with a breathable, your-skin-but-better glow.",
    ing: ["Hyaluronic Acid", "Niacinamide", "Mineral Pigments"],
  },
  {
    id: "20", name: "Soft Cheek Cream Blush", category: "Makeup", type: "Cheeks",
    price: 890, old: null, rating: 4.7, reviews: 64, stock: 3, badge: null,
    shape: "jar", c1: "#FAEDEF", c2: "#E8C4CB", skin: "All skin tones",
    desc: "A dewy cream blush that melts into skin for a lit-from-within, just-pinched flush.",
    ing: ["Squalane", "Vitamin E", "Mineral Pigments"],
  },
  {
    id: "21", name: "Feather Brow Gel", category: "Makeup", type: "Eyes",
    price: 720, old: null, rating: 4.5, reviews: 47, stock: 23, badge: null,
    shape: "mist", c1: "#F0E9F2", c2: "#C3AECB", skin: "All brow types",
    desc: "A tinted brow gel that grooms and sets feathery brows in place all day.",
    ing: ["Panthenol", "Castor Oil", "Fiber Complex"],
  },
];

/* --------- helpers --------- */
export const getProductById = (id) =>
  PRODUCTS.find((p) => String(p.id) === String(id));

export const getBestsellers = () =>
  PRODUCTS.filter((p) => p.badge === "Bestseller");

export const getRelated = (product, limit = 4) =>
  PRODUCTS.filter((p) => p.id !== product.id && p.type === product.type)
    .concat(
      PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category && p.type !== product.type)
    )
    .slice(0, limit);

export const getByCategory = (category) =>
  PRODUCTS.filter((p) => p.category === category);
