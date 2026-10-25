import Banner from "../../../models/Banner.js";
import AppError from "../../../utils/AppError.js";

const trimIfString = (value) => (typeof value === "string" ? value.trim() : value);

// Public: only slides that are switched on.
export const getActiveBanners = async ({ placement = "hero", pagePath } = {}) => {
  const filter = { active: true, placement };
  if (placement === "pageHeader") {
    // Never let a missing page key turn into one global header for all pages.
    if (!pagePath) return [];
    filter.pagePath = pagePath;
  }
  return await Banner.find(filter)
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
    placement: bannerData.placement ?? "hero",
    pagePath: bannerData.pagePath ?? "",
    src: bannerData.src.trim(),
    href: bannerData.href?.trim() || "/shop",
    active: bannerData.active ?? true,
    order: bannerData.order ?? 0,
  });
};

export const updateBanner = async (id, bannerData) => {
  const allowedFields = ["title", "subtitle", "type", "placement", "pagePath", "src", "href", "active", "order"];
  const updates = {};

  for (const field of allowedFields) {
    if (bannerData[field] !== undefined) {
      updates[field] = trimIfString(bannerData[field]);
    }
  }

  const existing = await Banner.findById(id);
  if (!existing) return null;

  const placement = updates.placement ?? existing.placement;
  const pagePath = updates.pagePath ?? existing.pagePath;
  if (placement === "pageHeader" && !pagePath) {
    throw new AppError("A page path is required for a page header.", 400);
  }

  return await Banner.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-__v");
};

export const deleteBanner = async (id) => {
  return await Banner.findByIdAndDelete(id);
};

export const reorderBanners = async (ids) => {
  await Banner.bulkWrite(
    ids.map((id, position) => ({
      updateOne: { filter: { _id: id, placement: "hero" }, update: { $set: { order: position } } },
    }))
  );
};