/**
 * Pattern I — Gauge / radial dial.
 *
 * Geometry note: the dial is the upper semicircle of a circle centred at
 * (CX, CY). 0% maps to the LEFT edge (math angle -180°), 50% to the TOP
 * (math angle -90°), 100% to the RIGHT edge (math angle 0°). Increasing the
 * value sweeps the fill counter-clockwise (visually) along the upper arc, so
 * for any value in [0, 100] the arc endpoint stays inside the dial — never
 * spilling into the lower half.
 *
 * The arc, needle and stroke colour are driven by motion values so the sweep
 * is genuinely 60fps with no React reconciliation per frame. The cycle walks
 * forward only — `from → to → hold` — and the wrapper opacity fades to 0
 * before the value snaps back to `from`, so the backward sweep is invisible.
 */

import { motion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Stage, HeaderRow, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

const RADIUS = 70
const CX = 100
const CY = 95
// SVG canvas: extra 5px headroom above the arc (so the stroke cap doesn't get
// clipped) and 5px below the pivot (so the pivot dot isn't flush with the box).
const VIEW_W = 200
const VIEW_H = 102

function angleFor(v: number) {
  // 0..100 → -180°..0° (left → top → right, sweeping CCW visually)
  return -180 + (v / 100) * 180
}

function arcDFor(value: number) {
  const angle = angleFor(value)
  const rad = (angle * Math.PI) / 180
  const startX = CX - RADIUS // (30, 95) — left edge of dial
  const startY = CY
  const endX = CX + RADIUS * Math.cos(rad)
  const endY = CY + RADIUS * Math.sin(rad)
  // small-arc + sweep=1 → arc traverses the upper semicircle (CCW visually)
  return `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`
}

function colorFor(value: number) {
  return value < 50 ? G.rose : value < 75 ? G.amber : G.emerald
}

function GaugeDial({ from, to, duration, label }: { from: number; to: number; duration: number; label: string }) {
  const mv = useMotionValue(from)
  const opacity = useMotionValue(0)

  const arcD = useTransform(mv, arcDFor)
  const stroke = useTransform(mv, colorFor)
  const needleX = useTransform(mv, (v) => CX + (RADIUS - 8) * Math.cos((angleFor(v) * Math.PI) / 180))
  const needleY = useTransform(mv, (v) => CY + (RADIUS - 8) * Math.sin((angleFor(v) * Math.PI) / 180))

  const [displayValue, setDisplayValue] = useState(Math.round(from))

  useEffect(() => {
    const valueCtrl = fmAnimate(mv, [from, from, to, to, to, from, from], {
      duration,
      times: [0, 0.06, 0.58, 0.86, 0.94, 0.96, 1],
      ease: [0.42, 0, 0.58, 1],
      repeat: Infinity,
    })
    const opacityCtrl = fmAnimate(opacity, [0, 1, 1, 0, 0], {
      duration,
      times: [0, 0.06, 0.86, 0.94, 1],
      ease: 'linear',
      repeat: Infinity,
    })
    const unsub = mv.on('change', (v) => {
      const r = Math.round(v)
      setDisplayValue((prev) => (prev === r ? prev : r))
    })
    return () => {
      valueCtrl.stop()
      opacityCtrl.stop()
      unsub()
    }
  }, [mv, opacity, from, to, duration])

  return (
    <motion.div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        paddingTop: 4,
        opacity,
      }}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', maxWidth: 220, height: 'auto', display: 'block' }}>
        {/* Background arc */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke="rgba(15, 23, 42, 0.06)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Filled arc — driven by motion value */}
        <motion.path d={arcD} fill="none" stroke={stroke} strokeWidth={10} strokeLinecap="round" />
        {/* Needle */}
        <motion.line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke={G.ink} strokeWidth={2} strokeLinecap="round" />
        {/* Pivot dot */}
        <circle cx={CX} cy={CY} r={3.5} fill={G.ink} />
      </svg>
      {/* Value + label sit cleanly below the dial */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ ...TABULAR, fontSize: 'clamp(26px, 6.5cqi, 36px)', fontWeight: 700, color: G.ink, lineHeight: 1 }}>
          {displayValue}
          <span style={{ fontSize: '0.55em', color: G.graphite, marginLeft: 2 }}>%</span>
        </span>
        <span style={{ ...LABEL, fontSize: 9, color: G.graphite }}>{label}</span>
      </div>
    </motion.div>
  )
}

export interface GaugeProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  fromValue: number
  toValue: number
  label: string
  duration?: number
}

export function GaugeCard({ eyebrow, iconKey, iconColor, fromValue, toValue, label, duration = 4 }: GaugeProps) {
  const settledColor = colorFor(toValue)
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor ?? settledColor} />} />
      <GaugeDial from={fromValue} to={toValue} duration={duration} label={label} />
    </Stage>
  )
}
