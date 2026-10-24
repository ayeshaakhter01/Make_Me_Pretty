import * as orders from "../../orders/services/orderService.js";
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req) }); } catch (error) { next(error); } };
export const assignments = wrap((req) => orders.getAssignments(req.user._id));
export const assignment = wrap((req) => orders.getAssignment(req.user._id, req.params.id));
export const updateStatus = wrap((req) => orders.updateDeliveryStatus(req.user._id, req.params.id, req.body.status));
export const collectCod = wrap((req) => orders.collectCodPayment(req.user._id, req.params.id));
export const getOrderMessages = wrap((req) => orders.listOrderMessages(req.user, req.params.id));
export const postOrderMessage = wrap((req) => orders.createOrderMessage(req.user, req.params.id, req.body));
