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
export {
  BANNER_PAGES,
  DISTRICTS,
  ORDER_STATUSES,
  cx,
  validBdPhone
};
