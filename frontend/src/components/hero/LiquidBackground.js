import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
const FLUID_SPEED = 1.5;
const COLORS = [
  [250, 216, 224],
  // light baby pink
  [246, 198, 210],
  // soft rose
  [238, 190, 200],
  // muted dusty rose
  [251, 226, 214],
  // pale peach
  [244, 190, 205],
  // petal
  [250, 224, 230]
  // pale pink
];
function LiquidBackground({ className = "" }) {
  const blobRef = useRef(null);
  const dotRef = useRef(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  useEffect(() => {
    const blobCanvas = blobRef.current;
    const dotCanvas = dotRef.current;
    if (!blobCanvas || !dotCanvas) return;
    const bctx = blobCanvas.getContext("2d");
    const dctx = dotCanvas.getContext("2d");
    const W = blobCanvas.width = 260;
    const H = blobCanvas.height = 150;
    const blobs = COLORS.map((c, i) => ({
      c,
      r: 55 + i % 3 * 22,
      sx: (12e-5 + i * 7e-5) * FLUID_SPEED,
      sy: (17e-5 + i * 5e-5) * FLUID_SPEED,
      px: i * 137 % 360,
      py: i * 251 % 360
    }));
    const parent = blobCanvas.parentElement;
    let DW = 0;
    let DH = 0;
    const fit = () => {
      DW = dotCanvas.width = parent.clientWidth || 1;
      DH = dotCanvas.height = parent.clientHeight || 1;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    const rand = (a, b) => a + Math.random() * (b - a);
    const particles = Array.from({ length: 56 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(0.9, 2.2),
      vy: rand(0.012, 0.035),
      // % of height per second (upward)
      sway: rand(8, 26),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.1),
      tone: Math.random(),
      // 0 white · 1 deep rose
      alpha: rand(0.5, 0.9)
    }));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf;
    let last = performance.now();
    const draw = (t) => {
      const dt = Math.min((t - last) / 1e3, 0.06);
      last = t;
      bctx.fillStyle = "#FCEEF1";
      bctx.fillRect(0, 0, W, H);
      const px = pointer.current.x * W;
      const py = pointer.current.y * H;
      for (const b of blobs) {
        let x = W * (0.5 + 0.42 * Math.sin(t * b.sx + b.px));
        let y = H * (0.5 + 0.4 * Math.cos(t * b.sy + b.py));
        if (pointer.current.active) {
          x += (px - x) * 0.18;
          y += (py - y) * 0.18;
        }
        const g = bctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.62)`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(x, y, b.r, 0, Math.PI * 2);
        bctx.fill();
      }
      dctx.clearRect(0, 0, DW, DH);
      for (const p of particles) {
        p.y += p.vy * dt * p.speed * 10;
        if (p.y > 1.03) {
          p.y = -0.03;
          p.x = Math.random();
        }
        const sway = Math.sin(t * 6e-4 * p.speed + p.phase) * p.sway;
        const x = p.x * DW + sway;
        const y = p.y * DH;
        const tw = 0.75 + 0.25 * Math.sin(t * 2e-3 + p.phase);
        const core = p.tone > 0.55 ? `rgba(183,110,121,${p.alpha * tw})` : `rgba(255,255,255,${Math.min(1, p.alpha * tw + 0.1)})`;
        const halo = p.tone > 0.55 ? `rgba(183,110,121,${0.22 * tw})` : `rgba(255,255,255,${0.28 * tw})`;
        dctx.beginPath();
        dctx.arc(x, y, p.r * 2, 0, Math.PI * 2);
        dctx.fillStyle = halo;
        dctx.fill();
        dctx.beginPath();
        dctx.arc(x, y, p.r, 0, Math.PI * 2);
        dctx.fillStyle = core;
        dctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (media.matches) {
      draw(4e4);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }
    const onMove = (e) => {
      const r = parent.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      pointer.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        active: true
      };
    };
    const onLeave = () => pointer.current.active = false;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: blobRef,
        "aria-hidden": true,
        className: `pointer-events-none absolute inset-0 h-full w-full ${className}`,
        style: { filter: "saturate(1.05)" }
      }
    ),
    /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: dotRef,
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-0 h-full w-full"
      }
    )
  ] });
}
export {
  LiquidBackground as default
};
