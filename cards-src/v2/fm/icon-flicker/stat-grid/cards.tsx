/**
 * Pattern J — Stat tile grid (2×2).
 * Four mini stat tiles, each with own number + label.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useLoopingPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface Stat {
  value: string
  label: string
  accent?: string
}

function Tile({ stat, delay }: { stat: Stat; delay: number }) {
  const phase = useLoopingPhase(4)
  const visible = phase >= delay
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'rgba(15, 23, 42, 0.04)',
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid rgba(15, 23, 42, 0.05)',
      }}
    >
      <span style={{ ...TABULAR, fontSize: 'clamp(18px, 5cqi, 28px)', fontWeight: 700, color: stat.accent ?? G.ink, lineHeight: 1 }}>
        {stat.value}
      </span>
      <span style={{ ...LABEL, fontSize: 8, color: G.graphite, marginTop: 2 }}>{stat.label}</span>
    </motion.div>
  )
}

export interface StatGridProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  stats: Stat[]
}

export function StatGridCard({ eyebrow, iconKey, iconColor = G.emerald, stats }: StatGridProps) {
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
        {stats.map((stat, i) => (
          <Tile key={i} stat={stat} delay={0.1 + i * 0.08} />
        ))}
      </div>
    </Stage>
  )
}
