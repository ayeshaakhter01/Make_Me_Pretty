import { Children, useEffect, useRef, useState } from 'react'

export default function StaggerReveal({ children, className = '', stagger = 120, threshold = 0.25, as: Element = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)))

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        observer.disconnect()
      }
    }, { threshold })
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return <Element ref={ref} className={className}>{Children.map(children, (child, index) => <div key={child?.key ?? index} style={shown ? { animationDelay: `${index * stagger}ms` } : undefined} className={`opacity-0 ${shown ? 'card-rise' : ''}`}>{child}</div>)}</Element>
}
