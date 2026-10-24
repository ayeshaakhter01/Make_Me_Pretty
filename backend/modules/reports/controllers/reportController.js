import { behaviourReport, productReport, salesReport } from "../services/reportService.js";
const wrap = (fn) => async (_req, res, next) => { try { res.json({ success: true, data: await fn() }); } catch (error) { next(error); } };
export const getSalesReport = wrap(salesReport);
export const getProductReport = wrap(productReport);
export const getBehaviourReport = wrap(behaviourReport);
