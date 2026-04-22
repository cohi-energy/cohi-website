/**
 * Pattern B — Sparkline + counter.
 * Number anchored to a tiny chart that crossfades from a "before" series to "after".
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useLoopingNumber, TABULAR, PALETTE as G, Icon, type IconKey } from '../shared'

const W = 240
const H = 50

function buildPath(vals: number[], max: number, min: number) {
  const range = max - min || 1
  return vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * W
      const y = H - ((v - min) / range) * H * 0.85
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export interface SparklineProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  prefix?: string
  suffix?: string
  from: number
  to: number
  duration?: number
  before: number[]
  after: number[]
  beforeColor?: string
  afterColor?: string
  format?: (n: number) => string
}

export function SparklineCard({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  prefix,
  suffix,
  from,
  to,
  duration = 4,
  before,
  after,
  beforeColor = G.silver,
  afterColor = G.emerald,
  format,
}: SparklineProps) {
  const value = useLoopingNumber(from, to, duration)
  const range = Math.abs(to - from) || 1
  const phase = Math.abs(value - from) / range
  const max = Math.max(...before, ...after)
  const min = Math.min(...before, ...after)
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        {prefix && <span style={{ ...TABULAR, fontSize: 18, color: G.graphite, fontWeight: 600 }}>{prefix}</span>}
        <span style={{ ...TABULAR, fontSize: 'clamp(36px, 9cqi, 60px)', fontWeight: 700, color: G.ink, lineHeight: 1 }}>
          {format ? format(value) : value.toLocaleString()}
        </span>
        {suffix && <span style={{ ...TABULAR, fontSize: 13, color: G.graphite, fontWeight: 600, marginLeft: 4 }}>{suffix}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 50, overflow: 'visible' }}>
        <motion.path d={buildPath(before, max, min)} fill="none" stroke={beforeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" animate={{ opacity: 1 - phase }} />
        <motion.path d={buildPath(after, max, min)} fill="none" stroke={afterColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" animate={{ opacity: phase }} />
      </svg>
    </Stage>
  )
}
