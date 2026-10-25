import * as service from "../services/policyService.js";
const wrap = (fn, status = 200) => async (req, res, next) => { try { const data = await fn(req); res.status(status).json({ success: true, data }); } catch (error) { next(error); } };
export const listPublic = wrap(() => service.listPublicPolicies());
export const getOne = wrap((req) => service.getPublicPolicy(req.params.slug));
export const listAdmin = wrap(() => service.listAdminPolicies());
export const create = wrap((req) => service.createPolicy(req.body), 201);
export const update = wrap((req) => service.updatePolicy(req.params.id, req.body));
export const remove = wrap((req) => service.deletePolicy(req.params.id));
