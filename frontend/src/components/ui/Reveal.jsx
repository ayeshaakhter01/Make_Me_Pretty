import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, delay = 0, className = '', as: Element = 'div' }) {
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <Element ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${className}`}>{children}</Element>
}
