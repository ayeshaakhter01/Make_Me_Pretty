import { getRecommendations } from "../services/skinAdvisorService.js";
export async function recommendations(req, res, next) { try { res.json({ success: true, data: await getRecommendations(req.body) }); } catch (error) { next(error); } }
