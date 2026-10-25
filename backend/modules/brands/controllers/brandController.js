import * as service from "../services/brandService.js";
const wrap = (fn, status = 200) => async (req, res, next) => { try { const data = await fn(req); res.status(status).json({ success: true, data }); } catch (error) { next(error); } };
export const listPublic = wrap(() => service.listPublicBrands());
export const listAdmin = wrap(() => service.listAdminBrands());
export const create = wrap((req) => service.createBrand(req.body), 201);
export const update = wrap((req) => service.updateBrand(req.params.id, req.body));
export const remove = wrap((req) => service.deleteBrand(req.params.id));
