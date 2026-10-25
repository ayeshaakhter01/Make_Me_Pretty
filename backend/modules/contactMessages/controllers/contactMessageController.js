import * as service from "../services/contactMessageService.js";

export async function submitContactMessage(req, res, next) {
  try {
    // Quietly accept honeypot submissions without saving them or exposing the trap.
    if (typeof req.body?.website === "string" && req.body.website.trim()) {
      return res.status(202).json({ success: true, data: { accepted: true } });
    }
    const message = await service.createContactMessage(req.body);
    return res.status(201).json({ success: true, message: "Your message was sent to our team.", data: { id: message._id } });
  } catch (error) { return next(error); }
}

export async function listAdminContactMessages(req, res, next) {
  try {
    const messages = await service.listContactMessages(req.query.status || "all");
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) { return next(error); }
}

export async function updateAdminContactMessage(req, res, next) {
  try {
    const message = await service.updateContactMessageStatus(req.params.id, req.body);
    return res.status(200).json({ success: true, data: message });
  } catch (error) { return next(error); }
}
