
import * as service from "../services/siteSettingsService.js";

export async function getPublicSettings(req, res, next) {
  try {
    res.json({
      success: true,
      data: await service.getStoreSettings(),
    });
  } catch (error) {
    next(error);
  }
}

export async function patchSettings(req, res, next) {
  try {
    res.json({
      success: true,
      data: await service.updateStoreSettings(req.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPolicies(req, res, next) {
  try {
    res.json({
      success: true,
      data: await service.listPolicies(req.query.public === "1"),
    });
  } catch (error) {
    next(error);
  }
}

export async function postPolicy(req, res, next) {
  try {
    res.status(201).json({
      success: true,
      data: await service.savePolicy(req.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function putPolicy(req, res, next) {
  try {
    res.json({
      success: true,
      data: await service.savePolicy({
        ...req.body,
        id: req.params.id,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function removePolicy(req, res, next) {
  try {
    res.json({
      success: true,
      data: await service.deletePolicy(req.params.id),
    });
  } catch (error) {
    next(error);
  }
}
