const GUIDES = {
  Cleanser: { when: 'AM & PM', steps: ['Wet your face with lukewarm water.', 'Massage a coin-sized amount onto skin for 30–60 seconds.', 'Rinse thoroughly and pat dry.'], tip: 'Double cleanse at night if you wore sunscreen or makeup.' },
  Toner: { when: 'AM & PM', steps: ['After cleansing, apply to a cotton pad or clean palms.', 'Sweep or press gently over face and neck.', 'Follow with serum and moisturizer while skin is damp.'], tip: 'Skip rubbing — pressing helps skin absorb more.' },
  Essence: { when: 'AM & PM', steps: ['Dispense a few drops into your palm.', 'Press gently into face and neck.', 'Layer your serum and moisturizer on top.'], tip: 'Apply on damp skin for better absorption.' },
  Serum: { when: 'AM & PM', steps: ['Cleanse and tone first.', 'Apply 2–3 drops to face and neck.', 'Let it absorb for a minute, then moisturize.'], tip: 'Patch test on your inner arm for 24 hours before first use.' },
  Moisturizer: { when: 'AM & PM', steps: ['Apply after serum on clean skin.', 'Warm a pea-to-almond-sized amount between fingers.', 'Smooth upward and outward over face and neck.'], tip: 'In the morning, always finish with sunscreen.' },
  Sunscreen: { when: 'Every morning', steps: ['Apply as the last step of your morning routine.', 'Use about two finger-lengths for face and neck.', 'Reapply every 2–3 hours when outdoors.'], tip: 'Apply 15 minutes before heading out.' },
  'Face Mask': { when: '1–2× a week', steps: ['Apply an even layer to clean, dry skin, avoiding eyes and lips.', 'Leave on for 10–15 minutes.', 'Rinse with lukewarm water and follow with moisturizer.'], tip: 'Do not let the mask dry out completely.' },
  'Body Lotion': { when: 'Daily', steps: ['Apply to slightly damp skin after showering.', 'Massage in until absorbed.', 'Focus on dry areas like elbows and knees.'], tip: 'Dampen skin first to lock in moisture.' },
  'Body Scrub': { when: '2–3× a week', steps: ['Apply to damp skin in the shower.', 'Massage in gentle circles for 1–2 minutes.', 'Rinse well and moisturize.'], tip: 'Avoid broken or freshly shaved skin.' },
  'Body Wash': { when: 'Daily', steps: ['Squeeze onto a pouf or wet palms.', 'Lather over body.', 'Rinse thoroughly.'], tip: 'Use lukewarm water to protect your skin barrier.' },
  'Hand Cream': { when: 'As needed', steps: ['Take a small amount onto hands.', 'Rub into hands, cuticles and nails.', 'Reapply after washing hands.'], tip: 'Keep one by your bed for an overnight treatment.' },
  Shampoo: { when: '2–3× a week', steps: ['Wet hair thoroughly.', 'Massage a small amount into the scalp.', 'Rinse well, then condition the lengths.'], tip: 'Focus on the scalp, not the ends.' },
  Conditioner: { when: 'After every shampoo', steps: ['Squeeze excess water from hair.', 'Apply from mid-lengths to ends.', 'Leave for 2–3 minutes, then rinse.'], tip: 'Use a wide-tooth comb to spread evenly.' },
  'Hair Mask': { when: 'Once a week', steps: ['Apply to damp, shampooed hair from mid-lengths to ends.', 'Leave on for 10–20 minutes.', 'Rinse thoroughly.'], tip: 'Wrap hair in a warm towel to boost absorption.' },
  'Hair Oil': { when: '1–2× a week', steps: ['Warm a few drops between palms.', 'Massage into scalp and/or lengths.', 'Leave for at least 30 minutes (or overnight), then shampoo out.'], tip: 'Start with less — you can always add more.' },
  Face: { when: 'Daily', steps: ['Prep with moisturizer and sunscreen.', 'Apply a small amount and blend with fingers or a sponge.', 'Build coverage in thin layers.'], tip: 'Set with powder for longer wear.' },
  Eyes: { when: 'Daily', steps: ['Start with clean, moisturized eyelids.', 'Apply with a brush or fingertip, blending outward.', 'Build intensity gradually.'], tip: 'Remove with a gentle eye makeup remover at night.' },
  Lip: { when: 'Daily', steps: ['Prep lips with balm if dry.', 'Apply from the center outwards.', 'Blot and reapply for more intensity.'], tip: 'Line lips first for a longer-lasting finish.' },
  Cheeks: { when: 'Daily', steps: ['Smile and apply to the apples of your cheeks.', 'Blend upward toward temples.', 'Build colour gradually.'], tip: 'Tap, don’t swipe, to avoid patchiness.' },
}

const FALLBACK = { when: 'As directed', steps: ['Use on clean skin.', 'Apply a small amount and massage in gently.', 'Follow with the next step of your routine.'], tip: 'Patch test before first use.' }

export function getUsageGuide(product) {
  const base = GUIDES[product.type] || FALLBACK
  return { ...base, ...(product.usage || {}) }
}