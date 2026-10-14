import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function SectionHeading({ eyebrow, title, description, linkTo, linkLabel = 'Shop all' }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="max-w-xl">
        {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-rose">{eyebrow}</p>}
        <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">{description}</p>}
      </div>
      {linkTo && <Link to={linkTo} className="group inline-flex items-center gap-2 pb-1 text-sm font-medium text-ink hover:text-rose-deep">{linkLabel}<Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" /></Link>}
    </div>
  )
}
