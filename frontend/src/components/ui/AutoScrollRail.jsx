import { useEffect, useRef } from 'react'

export default function AutoScrollRail({ items, renderItem, getKey, className = '', auto = false, speed = 0.55, label }) {
  const railRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const doubledItems = auto ? [...items, ...items] : items

  useEffect(() => {
    if (!auto) return undefined
    const rail = railRef.current
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame
    let lastTime = 0
    const tick = (time) => {
      if (lastTime && !dragRef.current.active) {
        rail.scrollLeft += ((time - lastTime) / 16.67) * speed
        const loopWidth = rail.scrollWidth / 2
        if (loopWidth && rail.scrollLeft >= loopWidth) rail.scrollLeft -= loopWidth
      }
      lastTime = time
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [auto, items.length, speed])

  function startDrag(event) {
    if (event.button !== 0) return
    dragRef.current = { active: true, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('cursor-grabbing')
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag.active) return
    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4) drag.moved = true
    event.currentTarget.scrollLeft = drag.startScroll - distance
  }

  function endDrag(event) {
    dragRef.current.active = false
    event.currentTarget.classList.remove('cursor-grabbing')
  }

  function blockDragClick(event) {
    if (!dragRef.current.moved) return
    event.preventDefault()
    event.stopPropagation()
    dragRef.current.moved = false
  }

  return <div ref={railRef} role="list" aria-label={label} className={`no-scrollbar flex cursor-grab select-none overflow-x-auto ${className}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={blockDragClick} style={{ scrollBehavior: 'auto', touchAction: 'pan-x' }}>{doubledItems.map((item, index) => renderItem(item, index, getKey(item, index), auto && index >= items.length))}</div>
}
