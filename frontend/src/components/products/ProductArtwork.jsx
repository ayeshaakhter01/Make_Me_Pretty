import { assetUrl } from '../../api.js'

const shapeElements = {
  pump: (fill, c2) => <><rect x="62" y="18" width="16" height="14" rx="3" fill={c2} /><path d="M70 18h26a4 4 0 0 1 4 4v4h-8" fill="none" stroke={c2} strokeWidth="7" strokeLinecap="round" /><rect x="58" y="32" width="24" height="16" rx="4" fill={c2} /><rect x="42" y="48" width="56" height="106" rx="16" fill={fill} /><rect x="52" y="86" width="36" height="34" rx="4" fill="rgba(255,255,255,.75)" /></>,
  jar: (fill, c2) => <><rect x="34" y="52" width="72" height="26" rx="10" fill={c2} /><rect x="30" y="76" width="80" height="76" rx="20" fill={fill} /><rect x="48" y="98" width="44" height="30" rx="4" fill="rgba(255,255,255,.75)" /></>,
  dropper: (fill, c2) => <><circle cx="70" cy="20" r="9" fill={c2} /><rect x="63" y="26" width="14" height="22" rx="4" fill={c2} /><path d="M70 48v26" stroke={c2} strokeWidth="5" /><rect x="46" y="66" width="48" height="88" rx="14" fill={fill} /><rect x="55" y="94" width="30" height="30" rx="4" fill="rgba(255,255,255,.75)" /></>,
  tube: (fill, c2) => <><rect x="56" y="22" width="28" height="14" rx="5" fill={c2} /><path d="M50 40h40l6 100a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12z" fill={fill} /><rect x="54" y="80" width="32" height="32" rx="4" fill="rgba(255,255,255,.75)" /></>,
  mist: (fill, c2) => <><path d="M60 20h20v14H60z" fill={c2} /><rect x="54" y="32" width="32" height="14" rx="5" fill={c2} /><rect x="46" y="46" width="48" height="108" rx="14" fill={fill} /><rect x="55" y="84" width="30" height="34" rx="4" fill="rgba(255,255,255,.75)" /></>,
}

function safeId(value) {
  return `product-${String(value).replace(/[^a-zA-Z0-9-]/g, '')}`
}

export default function ProductArtwork({ product, className = '', size = 1, fallbackLabel = 'Beauty product' }) {
  // Category tiles still render before the first real products are published.
  if (!product) {
    const placeholderId = safeId(fallbackLabel)
    return <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ background: 'linear-gradient(160deg, #F6DEE3, #fff 130%)' }}><svg viewBox="0 0 140 170" width={140 * size} height={170 * size} aria-label={`${fallbackLabel} product photo coming soon`} role="img" className="max-w-full"><defs><linearGradient id={placeholderId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F6DEE3"/><stop offset="100%" stopColor="#DBA8B1"/></linearGradient></defs><rect x="56" y="22" width="28" height="14" rx="5" fill="#C98B96"/><path d="M50 40h40l6 100a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12z" fill={`url(#${placeholderId})`}/><rect x="54" y="80" width="32" height="36" rx="5" fill="rgba(255,255,255,.8)"/><path d="M70 88c-5-9-15-2-9 5l9 9 9-9c6-7-4-14-9-5z" fill="#C98B96"/></svg></div>
  }
  if (product.images?.[0]) return <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ background: '#fff' }}><img src={assetUrl(product.images[0])} alt={product.name} className="size-full object-contain" loading="lazy" /></div>
  const gradientId = safeId(product.id)
  const palette = product.category === 'Makeup' ? ['#F6D9CC', '#C98574'] : product.category === 'Hair Care' ? ['#DDE9DC', '#729577'] : product.category === 'Body Care' ? ['#E4DDF3', '#9283B5'] : ['#F6DEE3', '#DBA8B1']
  const c1 = product.c1 ?? product.colors?.[0] ?? palette[0]
  const c2 = product.c2 ?? product.colors?.[1] ?? palette[1]
  const fill = `url(#${gradientId})`
  const type = String(product.type || '').toLowerCase()
  const inferredShape = /serum|ampoule|essence/.test(type) ? 'dropper' : /toner|mist/.test(type) ? 'mist' : /cream|moisturizer|lotion|mask|lip care/.test(type) ? 'jar' : /cleanser|wash|bb cream|sunscreen/.test(type) ? 'tube' : /shampoo/.test(type) ? 'pump' : 'pump'
  const shape = shapeElements[product.shape || inferredShape]

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${c1}, #fff 130%)` }}>
      <svg viewBox="0 0 140 170" width={140 * size} height={170 * size} role="img" aria-label={`${product.name} illustrative artwork, not a package photo`} className="max-w-full">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient></defs>
        {shape(fill, c2)}
        <text x="70" y="99" textAnchor="middle" fontSize="4" fontWeight="700" fill="#49363a">{(product.brand || 'BEAUTY').slice(0, 12)}</text>
        <text x="70" y="106" textAnchor="middle" fontSize="3.5" fill="#49363a">{product.name.slice(0, 16)}</text>
      </svg>
      <span className="pointer-events-none absolute bottom-1 right-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-ink-soft">Illustration</span>
    </div>
  )
}
