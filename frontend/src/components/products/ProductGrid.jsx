import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products }) {
  if (products.length === 0) return <p className="rounded-3xl bg-white px-6 py-16 text-center text-muted">No products found. Try another category.</p>

  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">{products.map((product, index) => <div key={product.id} className="animate-fadeup" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}><ProductCard product={product} /></div>)}</div>
}
