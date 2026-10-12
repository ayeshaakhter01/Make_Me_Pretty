const cx = (...args) => args.filter(Boolean).join(" ");
const DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Gazipur",
  "Narayanganj",
  "Bogura"
];
const ORDER_STATUSES = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];
const validBdPhone = (phone) => /^01\d{9}$/.test(phone);
const BANNER_PAGES = ["Skincare", "Body Care", "Hair Care", "Makeup", "Offers"];
const CATEGORY_ROUTES = {
  "Skincare": "/skincare",
  "Body Care": "/bodycare",
  "Hair Care": "/haircare",
  "Makeup": "/makeup"
};
const categoryHref = (name, type) => {
  const base = CATEGORY_ROUTES[name] || `/shop?category=${encodeURIComponent(name)}`;
  if (!type) return base;
  return `${base}${base.includes("?") ? "&" : "?"}type=${encodeURIComponent(type)}`;
};
export {
  BANNER_PAGES,
  CATEGORY_ROUTES,
  categoryHref,
  DISTRICTS,
  ORDER_STATUSES,
  cx,
  validBdPhone
};
