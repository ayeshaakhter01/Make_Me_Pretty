import { useEffect, useState } from 'react'
import { useCatalog } from '../context/useCatalog.js'
import { apiRequest } from '../api.js'
import ProductScroller from '../components/home/ProductScroller.jsx'
import HeroCarousel from '../components/home/HeroCarousel.jsx'
import TrustMarquee from '../components/home/TrustMarquee.jsx'
import PageContainer from '../components/ui/PageContainer.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import BrandShowcase from '../components/home/BrandShowcase.jsx'
import BlogSection from '../components/home/BlogSection.jsx'
import BrandStory from '../components/home/BrandStory.jsx'
import ReviewsSection from '../components/home/ReviewsSection.jsx'
import ShareYourGlow from '../components/home/ShareYourGlow.jsx'
import HomeCategoriesSection from '../components/home/HomeCategoriesSection.jsx'
import Reveal from '../components/ui/Reveal.jsx'

export default function HomePage() {
  const { products } = useCatalog()
  const [bestSellers, setBestSellers] = useState([])
  useEffect(() => {
    let cancelled = false
    apiRequest('/products/best-sellers').then((data) => {
      if (!cancelled) setBestSellers(data.map((product) => ({ ...product, id: String(product._id), old: product.compareAt ?? null, desc: product.description ?? '', ing: product.ingredients ?? [] })))
    }).catch(() => { if (!cancelled) setBestSellers([]) })
    return () => { cancelled = true }
  }, [])
  const featured = products.filter((product) => product.badge === 'Featured')
  return <>
    <HeroCarousel />
    <TrustMarquee />
    <HomeCategoriesSection />
    {featured.length > 0 && <PageContainer className="pb-16 pt-0"><Reveal><SectionHeading eyebrow="Selected for your routine" title="Featured products" linkTo="/shop" linkLabel="View all products"/></Reveal><Reveal><ProductScroller products={featured}/></Reveal></PageContainer>}
    {bestSellers.length > 0 && <PageContainer className="pb-16 pt-0"><Reveal><SectionHeading eyebrow="Loved by our shoppers" title="Best sellers" linkTo="/shop" linkLabel="Shop all products"/></Reveal><Reveal><ProductScroller products={bestSellers}/></Reveal></PageContainer>}
    <BrandShowcase />
    <BlogSection />
    <BrandStory />
    <ReviewsSection />
    <ShareYourGlow />
  </>
}
