const findProduct = (products, id) => products.find((p) => String(p.id) === String(id)) || null;
const getBestsellers = (products) => products.filter((p) => p.badge === "Bestseller");
const getByCategory = (products, category) => products.filter((p) => p.category === category);
const getRelated = (products, product, limit = 4) => products.filter((p) => p.id !== product.id && p.type === product.type).concat(
  products.filter(
    (p) => p.id !== product.id && p.category === product.category && p.type !== product.type
  )
).slice(0, limit);
const findCombo = (combos, id) => combos.find((c) => String(c.id) === String(id)) || null;
const findPromoCoupon = (coupons) => (coupons || []).find((c) => c.kind === "coupon" && c.code) || null;
export {
  findCombo,
  findProduct,
  findPromoCoupon,
  getBestsellers,
  getByCategory,
  getRelated
};
