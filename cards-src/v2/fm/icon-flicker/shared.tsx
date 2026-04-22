/**
 * Shared primitives for the Sharp Icon × Live Data style.
 *
 * Visual language stays constant across all six content patterns:
 *   - Tabular numbers in Inter (700+ weight)
 *   - All-caps small labels with wide tracking
 *   - Solid-fill SVG icons (crisp through frosted glass)
 *   - Generous negative space
 */

import { motion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { GLASS_PALETTE as G, FONTS } from '../../tokens'

export const PALETTE = G

export const TABULAR: CSSProperties = {
  fontFamily: FONTS.sans,
  fontVariantNumeric: 'tabular-nums lining-nums',
  fontFeatureSettings: '"tnum"',
  letterSpacing: '-0.04em',
}

export const LABEL: CSSProperties = {
  fontFamily: FONTS.sans,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
}

export function Stage({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        padding: padded ? '20px 24px' : 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      {children}
    </div>
  )
}

/** Loops a number from `from` → `to` and back, snapping to integers. */
export function useLoopingNumber(from: number, to: number, duration: number) {
  const mv = useMotionValue(from)
  const display = useTransform(mv, (v) => Math.round(v))
  const [val, setVal] = useState(from)
  useEffect(() => {
    const controls = fmAnimate(mv, [from, to, to, from], {
      duration,
      times: [0, 0.5, 0.85, 1],
      ease: [0.22, 1, 0.36, 1],
      repeat: Infinity,
    })
    const unsub = display.on('change', (v) => setVal(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [mv, display, from, to, duration])
  return val
}

export interface SequenceFrame {
  /** Current numeric value (smoothly interpolated, snapped to integer) */
  value: number
  /** 0..1 — fades in at the very start, holds at 1, fades out before restart */
  opacity: number
  /** Index of the active waypoint in `values` */
  index: number
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * Walks forward through `values`, giving each waypoint equal HOLD time. The
 * timing alternates hold → transition → hold → transition → … → hold → fade-out,
 * where each hold is the same length regardless of index. At the end of the cycle
 * the wrapper opacity fades to 0, the value snaps back to `values[0]`, and
 * opacity fades back in — so the viewer never sees the number tick backwards.
 *
 * Cycle layout (fractions of `duration`):
 *   [fadeIn][H][T][H][T] … [H][fadeOut]    (N holds, N-1 transitions)
 * where the hold/transition ratio is controlled by `holdRatio` (hold vs trans
 * within the walk — holds get `holdRatio`, transitions get `1 - holdRatio`).
 */
export function useLoopingSequence(
  values: number[],
  duration: number,
  opts: { fadeRatio?: number; holdRatio?: number } = {}
): SequenceFrame {
  const fadeRatio = opts.fadeRatio ?? 0.05
  const holdRatio = opts.holdRatio ?? 0.65
  const phase = useMonotonicPhase(duration)
  const N = Math.max(1, values.length)
  if (N < 2) {
    return { value: values[0] ?? 0, opacity: 1, index: 0 }
  }
  const fadeIn = fadeRatio
  const fadeOut = fadeRatio
  const walkLen = 1 - fadeIn - fadeOut
  // Walk is made of N holds + (N-1) transitions. Hold gets share `holdRatio`,
  // transition gets `1 - holdRatio` — each divided evenly among their count.
  const holdTotal = walkLen * holdRatio
  const transTotal = walkLen * (1 - holdRatio)
  const H = holdTotal / N
  const T = N > 1 ? transTotal / (N - 1) : 0
  if (phase < fadeIn) {
    return { value: values[0], opacity: easeInOut(phase / fadeIn), index: 0 }
  }
  if (phase >= 1 - fadeOut) {
    const t = (phase - (1 - fadeOut)) / fadeOut
    return { value: values[N - 1], opacity: 1 - easeInOut(t), index: N - 1 }
  }
  // Inside walk: find which segment we're in.
  let cursor = fadeIn
  for (let i = 0; i < N; i++) {
    // Hold segment for values[i]
    const holdEnd = cursor + H
    if (phase < holdEnd) {
      return { value: Math.round(values[i]), opacity: 1, index: i }
    }
    cursor = holdEnd
    // Transition to values[i+1]
    if (i < N - 1) {
      const transEnd = cursor + T
      if (phase < transEnd) {
        const e = easeInOut((phase - cursor) / T)
        const raw = values[i] + (values[i + 1] - values[i]) * e
        // Index reports the target waypoint we are transitioning into, so the
        // caption label flips early — the value catches up as the ease resolves.
        return { value: Math.round(raw), opacity: 1, index: i + 1 }
      }
      cursor = transEnd
    }
  }
  // Fallback — shouldn't reach here because the fade-out branch covers the tail.
  return { value: Math.round(values[N - 1]), opacity: 1, index: N - 1 }
}

/** Loops phase 0 → 1 and back, useful for crossfade-style content. */
export function useLoopingPhase(duration: number) {
  const mv = useMotionValue(0)
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const controls = fmAnimate(mv, [0, 1, 1, 0], {
      duration,
      times: [0, 0.5, 0.85, 1],
      ease: [0.22, 1, 0.36, 1],
      repeat: Infinity,
    })
    const unsub = mv.on('change', (v) => setPhase(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [mv, duration])
  return phase
}

/** Monotonic 0 → 1 phase that snaps back to 0 at the end of each cycle. */
export function useMonotonicPhase(duration: number) {
  const mv = useMotionValue(0)
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const controls = fmAnimate(mv, [0, 1], {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    })
    const unsub = mv.on('change', (v) => setPhase(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [mv, duration])
  return phase
}

/** Eyebrow + icon row — used at the top of most patterns. */
export function HeaderRow({ eyebrow, icon }: { eyebrow: string; icon: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        // Fixed slot height keeps the icon at exactly the same y-position
        // across every card, regardless of how many letters the eyebrow has.
        minHeight: 32,
      }}
    >
      <span
        style={{
          ...LABEL,
          fontSize: 10,
          color: G.graphite,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0,
        }}
      >
        {eyebrow}
      </span>
      <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
    </div>
  )
}

/** Reusable savings/delta pill. */
export function Pill({
  visible,
  children,
  tone = 'positive',
}: {
  visible: boolean
  children: ReactNode
  tone?: 'positive' | 'negative' | 'neutral'
}) {
  const colors = tone === 'positive'
    ? { bg: `${G.emerald}22`, fg: G.emeraldDeep }
    : tone === 'negative'
    ? { bg: `${G.rose}22`, fg: G.roseDeep }
    : { bg: 'rgba(15, 23, 42, 0.06)', fg: G.graphite }
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 4 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: colors.bg,
        color: colors.fg,
        ...LABEL,
        fontSize: 10,
      }}
    >
      {children}
    </motion.div>
  )
}

// ────────── Icons ──────────

export function WalletIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M5 9c0-1.5 1.2-3 3-3h17c1.5 0 3 1.2 3 3v15c0 1.5-1.2 3-3 3H8c-1.7 0-3-1.3-3-3V9z" fill={color} />
      <circle cx="22" cy="17" r="2.4" fill="white" />
    </svg>
  )
}

export function BulbIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 4c-5 0-8 3.6-8 8 0 3 1.6 5.5 3.5 7v3c0 1 .9 2 2 2h5c1.1 0 2-1 2-2v-3c1.9-1.5 3.5-4 3.5-7 0-4.4-3-8-8-8z"
        fill={color}
      />
      <rect x="13" y="26" width="6" height="2" rx="1" fill={color} opacity="0.85" />
      <rect x="14" y="29" width="4" height="1.6" rx="0.8" fill={color} opacity="0.7" />
    </svg>
  )
}

export function WaveIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M3 18c2.5 0 2.5-6 5-6s2.5 9 5 9 2.5-12 5-12 2.5 6 5 6 2.5-3 5-3"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3 L26 6 V15 C26 21 22 26 16 29 C10 26 6 21 6 15 V6 Z" fill={color} />
      <path d="M11 16 L14.5 19.5 L21 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function MailIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="7" width="24" height="18" rx="2.5" fill={color} />
      <path d="M4.8 9.5 L16 18 L27.2 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function SparkIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3 L18.6 12.4 L28 15 L18.6 17.6 L16 27 L13.4 17.6 L4 15 L13.4 12.4 Z" fill={color} />
    </svg>
  )
}

export function BuildingIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M5 28 V10 L16 4 L27 10 V28 Z" fill={color} />
      <rect x="9" y="13" width="3" height="3" rx="0.4" fill="white" opacity="0.95" />
      <rect x="14.5" y="13" width="3" height="3" rx="0.4" fill="white" opacity="0.95" />
      <rect x="20" y="13" width="3" height="3" rx="0.4" fill="white" opacity="0.95" />
      <rect x="9" y="18.5" width="3" height="3" rx="0.4" fill="white" opacity="0.95" />
      <rect x="20" y="18.5" width="3" height="3" rx="0.4" fill="white" opacity="0.95" />
      <rect x="13.5" y="22" width="5" height="6" rx="0.4" fill="white" opacity="0.95" />
    </svg>
  )
}

export function BalanceIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="15" y="6" width="2" height="22" rx="1" fill={color} />
      <circle cx="16" cy="6" r="2.2" fill={color} />
      <path d="M5 13 L11 13 L8 21 Z" fill={color} />
      <path d="M21 13 L27 13 L24 21 Z" fill={color} />
      <rect x="11" y="27" width="10" height="2" rx="1" fill={color} />
    </svg>
  )
}

export type IconKey = 'wallet' | 'bulb' | 'wave' | 'shield' | 'mail' | 'spark' | 'building' | 'balance'

export function Icon({ name, color }: { name: IconKey; color: string }) {
  switch (name) {
    case 'wallet': return <WalletIcon color={color} />
    case 'bulb': return <BulbIcon color={color} />
    case 'wave': return <WaveIcon color={color} />
    case 'shield': return <ShieldIcon color={color} />
    case 'mail': return <MailIcon color={color} />
    case 'spark': return <SparkIcon color={color} />
    case 'building': return <BuildingIcon color={color} />
    case 'balance': return <BalanceIcon color={color} />
  }
}
