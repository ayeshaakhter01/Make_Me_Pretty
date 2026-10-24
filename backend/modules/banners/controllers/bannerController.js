import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../services/bannerService.js";

import validateBanner from "../../../validators/bannerValidator.js";
import { sendValidationError, sendNotFound } from "../../../utils/responseHelpers.js";

export const getBanners = async (req, res, next) => {
  try {
    const placement = req.query.placement === "pageHeader" ? "pageHeader" : "hero";
    const banners = await getActiveBanners({ placement, pagePath: req.query.page });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdminBanners = async (req, res, next) => {
  try {
    const banners = await getAllBanners();

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

export const createBannerRecord = async (req, res, next) => {
  try {
    const validation = validateBanner(req.body);

    if (!validation.isValid) {
      return sendValidationError(res, "Banner validation failed", validation.errors);
    }

    const banner = await createBanner(req.body);

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBannerRecord = async (req, res, next) => {
  try {
    const validation = validateBanner(req.body, true);

    if (!validation.isValid) {
      return sendValidationError(res, "Banner validation failed", validation.errors);
    }

    const banner = await updateBanner(req.params.id, req.body);

    if (!banner) {
      return sendNotFound(res, "Banner not found");
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBannerRecord = async (req, res, next) => {
  try {
    const banner = await deleteBanner(req.params.id);

    if (!banner) {
      return sendNotFound(res, "Banner not found");
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};
