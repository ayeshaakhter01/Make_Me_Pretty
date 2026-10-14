import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import ProductGrid from '../components/products/ProductGrid.jsx'
import { useCart } from '../context/useCart.js'

export default function WishlistPage() {
  const { wishlist } = useCart()
  return <PageContainer className="max-w-[1200px] py-12"><header className="mb-8 text-center"><h1 className="font-serif text-[40px] font-normal">Your Wishlist</h1><p className="mt-2 text-ink-soft">{wishlist.length ? `${wishlist.length} saved ${wishlist.length === 1 ? 'product' : 'products'} — tap the heart on any card to add or remove.` : 'Tap the ♡ on any product to save it here for later.'}</p></header>{wishlist.length ? <ProductGrid products={wishlist}/> : <div className="flex flex-col items-center py-16 text-center"><div className="mb-4 flex h-24 w-20 items-center justify-center rounded-[60px_60px_16px_16px] bg-pink-soft text-4xl text-rose">♡</div><h2 className="font-serif text-2xl">Nothing saved yet</h2><p className="mt-2 max-w-sm text-ink-soft">Browse the collection and tap the heart on anything you love — it’ll wait for you here.</p><Link to="/shop" className="mt-6 inline-flex rounded-full bg-rose px-6 py-3 text-sm font-medium text-white hover:bg-rose-deep">Explore the collection</Link></div>}</PageContainer>
}
