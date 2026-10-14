import { products } from '../data/products.js'
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
  const bestsellers = products.filter((product) => product.badge === 'Bestseller')
  return <>
    <HeroCarousel />
    <TrustMarquee />
    <HomeCategoriesSection />
    <PageContainer className="pb-16 pt-0"><Reveal><SectionHeading eyebrow="Customer favourites" title="The Bestsellers" linkTo="/shop" linkLabel="View all products"/></Reveal><Reveal><ProductScroller products={bestsellers}/></Reveal></PageContainer>
    <BrandShowcase />
    <BlogSection />
    <BrandStory />
    <ReviewsSection />
    <ShareYourGlow />
  </>
}
