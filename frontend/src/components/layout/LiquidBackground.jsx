import { useEffect, useRef } from 'react'

const COLORS = [[250, 216, 224], [246, 198, 210], [238, 190, 200], [251, 226, 214], [244, 190, 205], [250, 224, 230]]
const FLUID_SPEED = 1.5

export default function LiquidBackground() {
  const fluidCanvasRef = useRef(null)
  const particleCanvasRef = useRef(null)
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false })

  useEffect(() => {
    const fluidCanvas = fluidCanvasRef.current
    const particleCanvas = particleCanvasRef.current
    const surface = fluidCanvas?.parentElement
    const fluid = fluidCanvas?.getContext('2d')
    const particlesContext = particleCanvas?.getContext('2d')
    if (!fluidCanvas || !particleCanvas || !surface || !fluid || !particlesContext) return undefined

    const fluidWidth = fluidCanvas.width = 260
    const fluidHeight = fluidCanvas.height = 150
    const blobs = COLORS.map((color, index) => ({
      color,
      radius: 55 + (index % 3) * 22,
      speedX: (0.00012 + index * 0.00007) * FLUID_SPEED,
      speedY: (0.00017 + index * 0.00005) * FLUID_SPEED,
      phaseX: (index * 137) % 360,
      phaseY: (index * 251) % 360,
    }))
    let width = 1
    let height = 1
    const resize = () => {
      width = particleCanvas.width = Math.max(1, surface.clientWidth)
      height = particleCanvas.height = Math.max(1, surface.clientHeight)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(surface)

    const random = (min, max) => min + Math.random() * (max - min)
    const particles = Array.from({ length: 56 }, () => ({
      x: Math.random(), y: Math.random(), radius: random(0.9, 2.2),
      // The original rate crossed the full page in only a few seconds. Keep
      // the same gentle fall, but let each mote drift for longer.
      velocity: random(0.004, 0.012), sway: random(8, 26), phase: random(0, Math.PI * 2),
      speed: random(0.4, 1.1), tone: Math.random(), alpha: random(0.5, 0.9),
    }))

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let lastTime = performance.now()
    const draw = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.06)
      lastTime = time
      fluid.fillStyle = '#FCEEF1'
      fluid.fillRect(0, 0, fluidWidth, fluidHeight)
      const pointerX = pointerRef.current.x * fluidWidth
      const pointerY = pointerRef.current.y * fluidHeight
      for (const blob of blobs) {
        let x = fluidWidth * (0.5 + 0.42 * Math.sin(time * blob.speedX + blob.phaseX))
        let y = fluidHeight * (0.5 + 0.4 * Math.cos(time * blob.speedY + blob.phaseY))
        if (pointerRef.current.active) {
          x += (pointerX - x) * 0.18
          y += (pointerY - y) * 0.18
        }
        const gradient = fluid.createRadialGradient(x, y, 0, x, y, blob.radius)
        gradient.addColorStop(0, `rgba(${blob.color.join(',')},0.62)`)
        gradient.addColorStop(1, `rgba(${blob.color.join(',')},0)`)
        fluid.fillStyle = gradient
        fluid.beginPath()
        fluid.arc(x, y, blob.radius, 0, Math.PI * 2)
        fluid.fill()
      }

      particlesContext.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.y += particle.velocity * delta * particle.speed * 10
        if (particle.y > 1.03) {
          particle.y = -0.03
          particle.x = Math.random()
        }
        const sway = Math.sin(time * 0.0006 * particle.speed + particle.phase) * particle.sway
        const x = particle.x * width + sway
        const y = particle.y * height
        const twinkle = 0.75 + 0.25 * Math.sin(time * 0.002 + particle.phase)
        const isRose = particle.tone > 0.55
        const core = isRose ? `rgba(183,110,121,${particle.alpha * twinkle})` : `rgba(255,255,255,${Math.min(1, particle.alpha * twinkle + 0.1)})`
        const halo = isRose ? `rgba(183,110,121,${0.22 * twinkle})` : `rgba(255,255,255,${0.28 * twinkle})`
        particlesContext.beginPath()
        particlesContext.arc(x, y, particle.radius * 2, 0, Math.PI * 2)
        particlesContext.fillStyle = halo
        particlesContext.fill()
        particlesContext.beginPath()
        particlesContext.arc(x, y, particle.radius, 0, Math.PI * 2)
        particlesContext.fillStyle = core
        particlesContext.fill()
      }
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw)
    }
    animationFrame = requestAnimationFrame(draw)

    const onPointerMove = (event) => {
      const bounds = surface.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      pointerRef.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height, active: true }
    }
    const onPointerLeave = () => { pointerRef.current.active = false }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FCEEF1]">
    <canvas ref={fluidCanvasRef} className="absolute inset-0 size-full" style={{ filter: 'saturate(1.05)' }} />
    <canvas ref={particleCanvasRef} className="absolute inset-0 size-full" />
  </div>
}
