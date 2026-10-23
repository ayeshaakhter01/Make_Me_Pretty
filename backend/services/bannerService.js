import Banner from "../models/Banner.js";

const trimIfString = (value) => (typeof value === "string" ? value.trim() : value);

// Public: only slides that are switched on.
export const getActiveBanners = async () => {
  return await Banner.find({ active: true })
    .sort({ order: 1, createdAt: -1 })
    .select("-__v");
};

// Admin: all slides, including hidden ones.
export const getAllBanners = async () => {
  return await Banner.find().sort({ order: 1, createdAt: -1 }).select("-__v");
};

export const createBanner = async (bannerData) => {
  return await Banner.create({
    title: bannerData.title?.trim() ?? "",
    subtitle: bannerData.subtitle?.trim() ?? "",
    type: bannerData.type ?? "image",
    src: bannerData.src.trim(),
    href: bannerData.href?.trim() || "/shop",
    active: bannerData.active ?? true,
    order: bannerData.order ?? 0,
  });
};

export const updateBanner = async (id, bannerData) => {
  const allowedFields = [
    "title",
    "subtitle",
    "type",
    "src",
    "href",
    "active",
    "order",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (bannerData[field] !== undefined) {
      updates[field] = trimIfString(bannerData[field]);
    }
  }

  return await Banner.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-__v");
};

export const deleteBanner = async (id) => {
  return await Banner.findByIdAndDelete(id);
};
