import ProductCard from '../products/ProductCard.jsx'
import AutoScrollRail from '../ui/AutoScrollRail.jsx'

export default function ProductScroller({ products }) {
  return <AutoScrollRail items={products} auto={false} label="Bestselling products" getKey={(product) => product.id} className="-mx-5 gap-4 px-5 pb-2 sm:-mx-8 sm:gap-5 sm:px-8 lg:-mx-10 lg:px-10" renderItem={(product) => <div role="listitem" key={product.id} className="w-[188px] shrink-0 sm:w-[248px]"><ProductCard product={product}/></div>}/>
}
