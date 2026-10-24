import * as service from "../services/siteSettingsService.js";
export async function getPublicSettings(req, res, next) {
  try { res.status(200).json({ success: true, data: await service.getStoreSettings() }); } catch (error) { next(error); }
}
export async function patchSettings(req, res, next) {
  try { res.status(200).json({ success: true, data: await service.updateStoreSettings(req.body) }); } catch (error) { next(error); }
}
