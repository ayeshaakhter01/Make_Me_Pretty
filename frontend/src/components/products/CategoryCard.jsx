import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/useCatalog.js'
import ProductArtwork from './ProductArtwork.jsx'

export default function CategoryCard({ category }) {
  const { products } = useCatalog()
  const sample = products.find((product) => product.category === category.name)

  return (
    <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className="group flex flex-col items-center rounded-3xl border border-line bg-cream p-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(59,48,44,0.09)] sm:p-6">
      <ProductArtwork product={sample} fallbackLabel={category.name} size={0.7} className="card-shine mb-2 aspect-square w-full rounded-2xl sm:mb-4" />
      <h3 className="font-serif text-lg">{category.name}</h3>
      <p className="mt-1 text-[12.5px] text-ink-soft">{category.note}</p>
    </Link>
  )
}
