import { useEffect, useRef } from 'react'

export default function AutoScrollRail({ items, renderItem, getKey, className = '', auto = false, speed = 0.55, label }) {
  const railRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startScroll: 0, axis: null, moved: false })
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
    dragRef.current = { active: true, startX: event.clientX, startY: event.clientY, startScroll: event.currentTarget.scrollLeft, axis: null, moved: false, captured: false }
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag.active) return
    const distance = event.clientX - drag.startX
    const verticalDistance = event.clientY - drag.startY
    const isNarrowScreen = window.matchMedia('(max-width: 639px)').matches
    if (isNarrowScreen && !drag.axis && Math.max(Math.abs(distance), Math.abs(verticalDistance)) > 6) {
      // Let an intentional vertical swipe continue scrolling the page.
      if (Math.abs(verticalDistance) >= Math.abs(distance)) {
        drag.active = false
        return
      }
      drag.axis = 'x'
    }
    if (!isNarrowScreen && !drag.moved && Math.abs(distance) > 4) drag.axis = 'x'
    if (drag.axis === 'x' && !drag.moved) {
      // Capture the pointer only once a real drag starts, so plain clicks still reach the product links.
      drag.moved = true
      drag.captured = true
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.classList.add('cursor-grabbing')
    }
    if (drag.moved) event.currentTarget.scrollLeft = drag.startScroll - distance
  }

  function endDrag(event) {
    const drag = dragRef.current
    if (drag.captured && event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    drag.active = false
    drag.captured = false
    event.currentTarget.classList.remove('cursor-grabbing')
    // If the pointer was released after a drag, the click that follows is swallowed once by blockDragClick.
    if (drag.moved) window.setTimeout(() => { dragRef.current.moved = false }, 0)
  }

  function blockDragClick(event) {
    if (!dragRef.current.moved) return
    event.preventDefault()
    event.stopPropagation()
    dragRef.current.moved = false
  }

  return <div ref={railRef} role="list" aria-label={label} className={`rail-scroll no-scrollbar flex cursor-grab select-none overflow-x-auto ${className}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={blockDragClick} style={{ scrollBehavior: 'auto' }}>{doubledItems.map((item, index) => renderItem(item, index, getKey(item, index), auto && index >= items.length))}</div>
}
