import CategoryCard from '../products/CategoryCard.jsx'
import { useCatalog } from '../../context/useCatalog.js'
import PageContainer from '../ui/PageContainer.jsx'
import Reveal from '../ui/Reveal.jsx'
import StaggerReveal from '../ui/StaggerReveal.jsx'

export default function HomeCategoriesSection() {
  const { categories } = useCatalog()
  return <PageContainer className="py-16"><Reveal className="mb-9 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Shop by category</p><h2 className="mt-2 font-serif text-[34px] font-normal">Find your ritual</h2></Reveal><StaggerReveal className="grid grid-cols-2 gap-4 md:grid-cols-4">{categories.map((category) => <CategoryCard key={category.name} category={category}/>)}</StaggerReveal></PageContainer>
}
