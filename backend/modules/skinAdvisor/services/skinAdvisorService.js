import Product from "../../../models/Product.js";

const DISCLAIMER = "These general product suggestions are not medical advice and do not diagnose or treat skin conditions. Patch test new products and consult a dermatologist for persistent or severe symptoms.";
const normalize = (value) => typeof value === "string" ? value.toLowerCase() : "";
function fallback(products, input) {
  const prompt = `${input.skinType || ""} ${(input.concerns || []).join(" ")} ${input.preferences || ""}`.toLowerCase();
  const ranked = products.map((product) => {
    const text = `${product.name} ${product.description} ${product.ingredients.join(" ")} ${product.skin} ${product.type}`.toLowerCase();
    const words = prompt.split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    return { product, score: words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0) };
  }).sort((a, b) => b.score - a.score || a.product.price - b.product.price).slice(0, 4);
  return { mode: "catalog-rules", summary: "Suggestions matched to your selected skin type and concerns from the products in our catalog.", recommendations: ranked.map(({ product, score }) => ({ productId: product._id, reason: score ? "Catalog details match some of the preferences you shared." : "A generally gentle option from the current catalog." })), disclaimer: DISCLAIMER };
}

export async function getRecommendations(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw Object.assign(new Error("Provide skin type and concerns."), { statusCode: 400 });
  if (typeof input.skinType !== "string" || input.skinType.length > 80 || !Array.isArray(input.concerns) || input.concerns.length > 8 || input.concerns.some((item) => typeof item !== "string" || item.length > 80) || (input.preferences && (typeof input.preferences !== "string" || input.preferences.length > 500))) throw Object.assign(new Error("Skin advisor input is invalid or too long."), { statusCode: 400 });
  const products = await Product.find({ active: true, category: /skin/i }).limit(100).select("name description ingredients skin type price images slug").lean();
  const basic = fallback(products, input);
  if (!process.env.GEMINI_API_KEY || !products.length) return basic;
  try {
    const model = (process.env.GEMINI_MODEL || "gemini-3.8-flash").replace(/["'\s]/g, "").replace(/^models\//, "");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: AbortSignal.timeout(45000),
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You provide cautious cosmetic product matching, never medical diagnosis or treatment advice. Use only the supplied catalog. Return JSON with summary and recommendations: an array of {productId, reason}. Keep reasons short, factual, and based on supplied catalog fields. If no safe match, return an empty array." }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ user: { skinType: input.skinType, concerns: input.concerns, preferences: input.preferences || "" }, catalog: products.slice(0, 60).map((p) => ({ productId: String(p._id), name: p.name, type: p.type, ingredients: (p.ingredients || []).slice(0, 8), skin: p.skin, description: String(p.description || "").slice(0, 160) })) }) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4, maxOutputTokens: 1024 },
      }),
    });
    if (!response.ok) { console.error("Gemini error", response.status, await response.text()); return basic; }
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    const result = JSON.parse((text || "{}").replace(/```json|```/g, "").trim());
    const ids = new Set(products.map((p) => String(p._id)));
    const recommendations = Array.isArray(result.recommendations) ? result.recommendations.filter((item) => ids.has(String(item.productId))).slice(0, 4).map((item) => ({ productId: item.productId, reason: String(item.reason || "Catalog match.").slice(0, 220) })) : [];
    return { mode: "ai", summary: String(result.summary || basic.summary).slice(0, 500), recommendations, disclaimer: DISCLAIMER };
  } catch (error) { console.error("Skin advisor AI failed:", error.message); return basic; }
}