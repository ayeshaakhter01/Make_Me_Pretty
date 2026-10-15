// "How to use" guides, keyed by product type.
// Each step is { label, text } and renders as "1. **Label:** text".
// Override per product by adding `usage: { steps, when, tip }` in catalog.js.
const s = (label, text) => ({ label, text })

const GUIDES = {
  Cleanser: { when: 'AM & PM', steps: [s('Wet', 'Splash your face with lukewarm water.'), s('Massage', 'Work a coin-sized amount over skin for 30–60 seconds.'), s('Rinse', 'Rinse thoroughly and pat dry.')], tip: 'Double cleanse at night if you wore sunscreen or makeup.' },
  Toner: { when: 'AM & PM', steps: [s('Apply', 'After cleansing, pour onto a cotton pad or clean palms.'), s('Press', 'Sweep or press gently over face and neck.'), s('Layer', 'Follow with serum and moisturizer while skin is damp.')], tip: 'Skip rubbing — pressing helps skin absorb more.' },
  Essence: { when: 'AM & PM', steps: [s('Dispense', 'Pour a few drops into your palm.'), s('Press', 'Press gently into face and neck.'), s('Layer', 'Apply serum and moisturizer on top.')], tip: 'Apply on damp skin for better absorption.' },
  Serum: { when: 'AM & PM', steps: [s('Prep', 'Cleanse and tone first.'), s('Apply', 'Smooth 2–3 drops over face and neck.'), s('Seal', 'Let it absorb for a minute, then moisturize.')] },
  Moisturizer: { when: 'AM & PM', steps: [s('Apply', 'Use after serum on clean skin.'), s('Warm', 'Warm a pea-to-almond-sized amount between fingers.'), s('Smooth', 'Spread upward and outward over face and neck.')], tip: 'In the morning, always finish with sunscreen.' },
  Sunscreen: { when: 'Every morning', steps: [s('Apply', 'Use as the last step of your morning routine.'), s('Amount', 'Use about two finger-lengths for face and neck.'), s('Reapply', 'Reapply every 2–3 hours when outdoors.')], tip: 'Apply 15 minutes before heading out.' },
  'Face Mask': { when: '1–2× a week', steps: [s('Apply', 'Spread an even layer on clean, dry skin, avoiding eyes and lips.'), s('Wait', 'Leave on for 10–15 minutes.'), s('Rinse', 'Rinse with lukewarm water and follow with moisturizer.')] },
  'Body Lotion': { when: 'Daily', steps: [s('Apply', 'Smooth onto slightly damp skin after showering.'), s('Massage', 'Massage in until absorbed.'), s('Focus', 'Give extra attention to dry areas like elbows and knees.')], tip: 'Dampen skin first to lock in moisture.' },
  'Body Scrub': { when: '2–3× a week', steps: [s('Apply', 'Scoop onto damp skin in the shower.'), s('Massage', 'Massage in gentle circles for 1–2 minutes.'), s('Rinse', 'Rinse well and moisturize.')] },
  'Body Wash': { when: 'Daily', steps: [s('Dispense', 'Squeeze onto a pouf or wet palms.'), s('Lather', 'Lather over the body.'), s('Rinse', 'Rinse thoroughly.')], tip: 'Use lukewarm water to protect your skin barrier.' },
  'Hand Cream': { when: 'As needed', steps: [s('Take', 'Squeeze a small amount onto your hands.'), s('Rub in', 'Work into hands, cuticles and nails.'), s('Repeat', 'Reapply after washing hands.')], tip: 'Keep one by your bed for an overnight treatment.' },
  Shampoo: { when: '2–3× a week', steps: [s('Wet', 'Wet hair thoroughly.'), s('Massage', 'Massage a small amount into the scalp.'), s('Rinse', 'Rinse well, then condition the lengths.')], tip: 'Focus on the scalp, not the ends.' },
  Conditioner: { when: 'After every shampoo', steps: [s('Squeeze', 'Squeeze excess water from hair.'), s('Apply', 'Apply from mid-lengths to ends.'), s('Rinse', 'Leave for 2–3 minutes, then rinse.')], tip: 'Use a wide-tooth comb to spread evenly.' },
  'Hair Mask': { when: 'Once a week', steps: [s('Apply', 'Spread on damp, shampooed hair from mid-lengths to ends.'), s('Wait', 'Leave on for 10–20 minutes.'), s('Rinse', 'Rinse thoroughly.')], tip: 'Wrap hair in a warm towel to boost absorption.' },
  'Hair Oil': { when: '1–2× a week', steps: [s('Warm', 'Warm a few drops between your palms.'), s('Massage', 'Massage into scalp and/or lengths.'), s('Wait', 'Leave for at least 30 minutes (or overnight), then shampoo out.')] },
  Face: { when: 'Daily', steps: [s('Prep', 'Prep with moisturizer and sunscreen.'), s('Apply', 'Apply a small amount and blend with fingers or a sponge.'), s('Build', 'Build coverage in thin layers.')], tip: 'Set with powder for longer wear.' },
  Eyes: { when: 'Daily', steps: [s('Prep', 'Start with clean, moisturized eyelids.'), s('Apply', 'Apply with a brush or fingertip, blending outward.'), s('Build', 'Build intensity gradually.')] },
  Lip: { when: 'Daily', steps: [s('Prep', 'Prep lips with balm if dry.'), s('Apply', 'Apply from the center outwards.'), s('Blot', 'Blot and reapply for more intensity.')], tip: 'Line lips first for a longer-lasting finish.' },
  Cheeks: { when: 'Daily', steps: [s('Smile', 'Smile and apply to the apples of your cheeks.'), s('Blend', 'Blend upward toward temples.'), s('Build', 'Build colour gradually.')], tip: 'Tap, don’t swipe, to avoid patchiness.' },
}

const FALLBACK = { when: 'As directed', steps: [s('Prep', 'Use on clean skin.'), s('Apply', 'Apply a small amount and massage in gently.'), s('Follow', 'Continue with the next step of your routine.')] }

export function getUsageGuide(product) {
  const base = GUIDES[product.type] || FALLBACK
  return { ...base, ...(product.usage || {}) }
}