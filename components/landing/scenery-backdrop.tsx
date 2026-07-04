'use client'

import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'

// Deterministic pseudo-random so server and client render identical markup
// (no hydration mismatch). Based on a hashed index.
function rand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: rand(i, 1) * 100,
  top: rand(i, 2) * 52,
  size: 1 + rand(i, 3) * 1.8,
  delay: rand(i, 4) * 5,
  dur: 3 + rand(i, 5) * 4,
}))

const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: rand(i, 6) * 100,
  bottom: rand(i, 7) * 40,
  size: 2 + rand(i, 8) * 4,
  delay: rand(i, 9) * 9,
  dur: 9 + rand(i, 10) * 8,
}))

// Layered ridge lines (viewBox 1440x500, stretched to fill).
const RIDGE_FAR =
  'M0 360 C 200 330 320 350 480 322 C 700 285 840 330 1010 318 C 1240 300 1340 340 1440 328 L1440 500 L0 500 Z'
const RIDGE_MID =
  'M0 410 C 200 356 360 398 560 348 C 760 300 900 380 1080 350 C 1250 322 1360 372 1440 352 L1440 500 L0 500 Z'
const RIDGE_NEAR =
  'M0 500 L0 432 C 170 384 320 424 500 392 C 690 358 820 432 1010 402 C 1220 368 1340 424 1440 402 L1440 500 Z'

export function SceneryBackdrop() {
  const reduced = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 40, damping: 18 })
  const smy = useSpring(my, { stiffness: 40, damping: 18 })

  // Parallax offsets — nearer layers move more.
  const farX = useTransform(smx, (v) => v * 6)
  const farY = useTransform(smy, (v) => v * 3)
  const midX = useTransform(smx, (v) => v * 14)
  const midY = useTransform(smy, (v) => v * 7)
  const nearX = useTransform(smx, (v) => v * 26)
  const nearY = useTransform(smy, (v) => v * 12)
  const skyX = useTransform(smx, (v) => v * -10)
  const skyY = useTransform(smy, (v) => v * -5)

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, mx, my])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Sky gradient — dawn in light, twilight in dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-indigo-100 to-rose-50 dark:from-[#080b22] dark:via-[#131a3d] dark:to-[#0b1030]" />

      {/* Celestial glow (sun / moon), gently parallaxed against the mouse */}
      <motion.div style={{ x: skyX, y: skyY }} className="absolute inset-0">
        {/* rays (light mode) */}
        <div
          className="animate-scenery-spin absolute left-[68%] top-[8%] h-[520px] w-[520px] -translate-x-1/2 opacity-40 dark:opacity-0"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.28) 12deg, transparent 24deg, transparent 36deg, rgba(251,191,36,0.22) 48deg, transparent 60deg)',
            maskImage: 'radial-gradient(closest-side, black 30%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(closest-side, black 30%, transparent 72%)',
          }}
        />
        {/* sun (light) */}
        <div className="animate-scenery-glow absolute left-[68%] top-[10%] h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,247,225,0.95),rgba(251,191,36,0.55)_45%,transparent_70%)] dark:opacity-0" />
        {/* moon (dark) */}
        <div className="animate-scenery-glow absolute left-[70%] top-[12%] h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(226,232,255,0.95),rgba(129,140,248,0.35)_50%,transparent_72%)] opacity-0 dark:opacity-100" />
      </motion.div>

      {/* Stars (dark mode only) */}
      <div className="absolute inset-0 opacity-0 transition-opacity dark:opacity-100">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="animate-scenery-twinkle absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Drifting clouds / mist */}
      <div className="absolute inset-x-0 top-[14%] h-40 opacity-70 dark:opacity-40">
        <div
          className="animate-scenery-sway absolute left-[8%] top-4 h-24 w-72 rounded-full bg-white/70 blur-2xl dark:bg-indigo-300/20"
          style={{ animationDuration: '11s' }}
        />
        <div
          className="animate-scenery-sway absolute right-[12%] top-10 h-20 w-64 rounded-full bg-white/60 blur-2xl dark:bg-indigo-300/15"
          style={{ animationDuration: '14s', animationDelay: '2s' }}
        />
      </div>

      {/* Mountain ridges (parallax) */}
      <motion.div style={{ x: farX, y: farY }} className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 500" preserveAspectRatio="none" className="h-[62vh] w-full text-sky-400/40 dark:text-[#1b2350]">
          <path d={RIDGE_FAR} fill="currentColor" />
        </svg>
      </motion.div>
      <motion.div style={{ x: midX, y: midY }} className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 500" preserveAspectRatio="none" className="h-[54vh] w-full text-indigo-500/50 dark:text-[#111634]">
          <path d={RIDGE_MID} fill="currentColor" />
        </svg>
      </motion.div>
      <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 500" preserveAspectRatio="none" className="h-[44vh] w-full text-indigo-800/80 dark:text-[#080b1e]">
          <path d={RIDGE_NEAR} fill="currentColor" />
        </svg>
      </motion.div>

      {/* Floating light motes / fireflies */}
      <div className="absolute inset-0">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-amber-300/70 shadow-[0_0_8px_2px_rgba(251,191,36,0.5)] dark:bg-teal-300/70 dark:shadow-[0_0_8px_2px_rgba(45,212,191,0.5)]"
            style={{
              left: `${m.left}%`,
              bottom: `${m.bottom}%`,
              width: m.size,
              height: m.size,
              animation: `scenery-float ${m.dur}s ease-in-out ${m.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Legibility scrim: soft light halo behind hero text + blend into page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_28%,rgba(255,255,255,0.55),transparent)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_28%,rgba(10,15,40,0.55),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
