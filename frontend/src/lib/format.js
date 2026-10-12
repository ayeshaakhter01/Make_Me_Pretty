const bdt = (n) => "\u09F3" + Number(n || 0).toLocaleString("en-IN");
const roundRating = (v) => Math.round(v || 0);
const discountPct = (price, old) => old && old > price ? Math.round((old - price) / old * 100) : 0;
export {
  bdt,
  discountPct,
  roundRating
};
