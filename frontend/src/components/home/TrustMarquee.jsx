import { DEFAULT_BRANDS } from '../../data/brandSource.js'

const trustPoints = [
  'Dermatologist Tested',
  'Cruelty Free',
  'Made for Humid Climates',
  'Fragrance Conscious',
  'bKash · Nagad · COD',
]
const marqueeItems = [...trustPoints, ...DEFAULT_BRANDS.map(({ brand }) => brand)]

function MarqueeItems({ hidden = false }) {
  return (
    <div className="flex shrink-0 gap-12 pr-12 text-[12.5px] uppercase tracking-[0.08em] text-rose-deep" aria-hidden={hidden}>
      {marqueeItems.map((item) => (
        <span key={item} className="flex items-center gap-12">
          {item}<span className="text-rose" aria-hidden="true">✿</span>
        </span>
      ))}
    </div>
  )
}

export default function TrustMarquee() {
  return (
    <div className="marquee-wrap overflow-hidden border-y border-line bg-pink-soft py-5">
      <div className="animate-marquee flex w-max whitespace-nowrap" aria-label="Our standards and brands">
        <MarqueeItems />
        <MarqueeItems hidden />
      </div>
    </div>
  )
}
