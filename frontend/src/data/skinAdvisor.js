/* =============================================================================
   Skin Advisor — the "brain" of the AI recommendation feature.

   RIGHT NOW (frontend phase): getRecommendations() is a MOCK. It reads the
   customer's words, spots skin concerns by keywords, and scores the store's
   Skincare products. No internet, no API key needed.

   LATER (backend phase): replace ONLY the body of getRecommendations() with a
   fetch() call to your Express server (see the TODO below). The server calls
   the real AI language-model API. Never put an AI API key in React code —
   anyone can read it in the browser.

   The shape returned by getRecommendations() is the "contract" between the
   screen and the brain. Keep it the same and the UI will not need changes:

   {
     concerns: [{ id: 'oily', label: 'Oily skin' }],
     summary:  'Short sentence about what the advisor understood.',
     picks:    [{ productId: '3', reason: 'Why this product suits you.' }]
   }
============================================================================= */

import { products } from './products.js'

/* Each concern = how to recognise it in the customer's text (keywords) and
   which products help (product types, ingredients, "best for" skin words). */
export const CONCERNS = [
  {
    id: 'oily',
    label: 'Oily skin',
    keywords: ['oily', 'oil', 'greasy', 'shiny', 'shine', 'sebum', 'pores', 'pore', 'combination'],
    types: ['Serum', 'Face Mask', 'Toner'],
    ingredients: ['niacinamide', 'zinc', 'kaolin'],
    skin: ['oily', 'combination'],
    benefit: 'helps balance excess oil and keeps pores looking refined',
  },
  {
    id: 'acne',
    label: 'Acne & breakouts',
    keywords: ['acne', 'pimple', 'pimples', 'breakout', 'breakouts', 'zit', 'zits', 'blemish', 'blemishes', 'blackhead', 'blackheads', 'whitehead', 'whiteheads'],
    types: ['Serum', 'Face Mask', 'Cleanser'],
    ingredients: ['niacinamide', 'zinc', 'kaolin', 'centella', 'allantoin'],
    skin: ['oily', 'combination'],
    benefit: 'is gentle on blemish-prone skin while calming the look of breakouts',
  },
  {
    id: 'dry',
    label: 'Dryness',
    keywords: ['dry', 'dryness', 'flaky', 'flaking', 'tight', 'dehydrated', 'rough', 'peeling', 'parched'],
    types: ['Moisturizer', 'Essence', 'Toner'],
    ingredients: ['ceramide', 'hyaluronic', 'squalane', 'glycerin', 'panthenol'],
    skin: ['dry'],
    benefit: 'locks in moisture and comforts dry, tight-feeling skin',
  },
  {
    id: 'sensitive',
    label: 'Sensitivity',
    keywords: ['sensitive', 'sensitivity', 'redness', 'red', 'irritated', 'irritation', 'itchy', 'stinging', 'burning', 'rash', 'reactive'],
    types: ['Moisturizer', 'Cleanser', 'Sunscreen'],
    ingredients: ['oat', 'centella', 'allantoin', 'panthenol', 'chamomile', 'ceramide'],
    skin: ['sensitive', 'all skin types'],
    benefit: 'is soothing and kind to easily irritated, reactive skin',
  },
  {
    id: 'dull',
    label: 'Dullness & dark spots',
    keywords: ['dull', 'dullness', 'glow', 'glowing', 'uneven', 'pigmentation', 'dark spots', 'dark spot', 'marks', 'scars', 'tone', 'brighten', 'brightening', 'tired'],
    types: ['Serum', 'Essence'],
    ingredients: ['vitamin c', 'niacinamide', 'fermented rice', 'galactomyces', 'ferulic'],
    skin: ['dull', 'uneven'],
    benefit: 'brightens dullness and helps fade the look of dark marks',
  },
  {
    id: 'aging',
    label: 'Fine lines',
    keywords: ['wrinkle', 'wrinkles', 'fine lines', 'fine line', 'aging', 'ageing', 'mature', 'firm', 'firmness', 'sagging'],
    types: ['Moisturizer', 'Serum'],
    ingredients: ['peptide', 'bakuchiol', 'ceramide', 'vitamin c'],
    skin: ['mature'],
    benefit: 'supports smoother, plumper-looking skin over time',
  },
  {
    id: 'sun',
    label: 'Sun protection',
    keywords: ['sun', 'spf', 'sunscreen', 'sunburn', 'tan', 'tanning', 'uv'],
    types: ['Sunscreen'],
    ingredients: ['uv filters'],
    skin: [],
    benefit: 'shields skin from daily UV, the biggest cause of dark spots and early lines',
  },
]

/* Quick example sentences the customer can tap to fill the box. */
export const EXAMPLE_PROMPTS = [
  'My skin gets oily by noon and I have acne on my cheeks.',
  'My face feels dry and tight, and it gets red easily.',
  'My skin looks dull and I want to fade dark spots.',
]

const MAX_PICKS = 4

function mentions(text, keyword) {
  return new RegExp(`\\b${keyword}\\b`, 'i').test(text)
}

/* Which concerns appear in the text, plus any chips the customer tapped. */
export function detectConcerns(text, chosenIds = []) {
  return CONCERNS.filter((concern) => chosenIds.includes(concern.id) || concern.keywords.some((keyword) => mentions(text, keyword)))
}

/* How well does one product match one concern? Returns a score + matched ingredients. */
function scoreProduct(product, concern) {
  const matchedIngredients = product.ing.filter((name) => concern.ingredients.some((wanted) => name.toLowerCase().includes(wanted)))
  const skinText = String(product.skin).toLowerCase()
  let score = 0
  if (concern.types.includes(product.type)) score += 2
  if (concern.skin.some((word) => skinText.includes(word))) score += 2
  score += matchedIngredients.length * 2
  return { score, matchedIngredients }
}

function joinNames(names) {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function buildReason(concern, matchedIngredients) {
  const withPart = matchedIngredients.length ? `With ${joinNames(matchedIngredients.slice(0, 2))}, it ` : 'It '
  return `${withPart}${concern.benefit}.`
}

export async function getRecommendations({ text = '', concernIds = [] }) {
  /* TODO (backend phase) — replace everything below with:

     const response = await fetch('/api/recommendations', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text, concernIds }),
     })
     if (!response.ok) throw new Error('Could not get recommendations')
     return response.json()   // must match the shape described at the top
  */

  await new Promise((resolve) => window.setTimeout(resolve, 1400)) // pretend the AI is thinking

  const concerns = detectConcerns(text, concernIds)
  if (concerns.length === 0) return { concerns: [], summary: '', picks: [] }

  const candidates = products.filter((product) => product.category === 'Skincare' && product.stock > 0)
  const ranked = candidates
    .map((product) => {
      let total = 0
      let best = { concern: concerns[0], score: -1, matchedIngredients: [] }
      for (const concern of concerns) {
        const result = scoreProduct(product, concern)
        total += result.score
        if (result.score > best.score) best = { concern, ...result }
      }
      return { product, total: total + product.rating / 10, best }
    })
    .filter((entry) => entry.best.score >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_PICKS)

  const labels = concerns.map((concern) => concern.label.toLowerCase())
  return {
    concerns: concerns.map(({ id, label }) => ({ id, label })),
    summary: `Based on what you shared, we focused on ${joinNames(labels)}. Here are the products from our shop that suit you best.`,
    picks: ranked.map((entry) => ({ productId: entry.product.id, reason: buildReason(entry.best.concern, entry.best.matchedIngredients) })),
  }
}
