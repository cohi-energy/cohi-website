/**
 * Pattern C — Stacked totals.
 * Line items animate in one by one and add up to a sum displayed at the top.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useLoopingNumber, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface LineItem {
  label: string
  value: number
}

export interface StackedTotalsProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  prefix?: string
  suffix?: string
  items: LineItem[]
  accent?: string
  duration?: number
}

function RunningTotal({ target, duration = 4 }: { target: number; duration?: number }) {
  const value = useLoopingNumber(0, target, duration)
  return (
    <span style={{ ...TABULAR, fontSize: 'clamp(28px, 7cqi, 46px)', fontWeight: 700, color: G.ink, lineHeight: 1 }}>
      {value.toLocaleString()}
    </span>
  )
}

export function StackedTotalsCard({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  prefix = '$',
  suffix,
  items,
  accent = G.emeraldDeep,
  duration = 4,
}: StackedTotalsProps) {
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          {prefix && (
            <span style={{ ...TABULAR, fontSize: 14, color: G.graphite, fontWeight: 600 }}>{prefix}</span>
          )}
          <RunningTotal target={total} duration={duration} />
          {suffix && (
            <span style={{ ...TABULAR, fontSize: 12, color: G.graphite, fontWeight: 600, marginLeft: 4 }}>
              {suffix}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: [0, 1, 1, 0], x: [-8, 0, 0, -8] }}
              transition={{
                duration,
                repeat: Infinity,
                times: [0, 0.18 + i * 0.12, 0.85, 0.98],
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
            >
              <span style={{ ...LABEL, fontSize: 9, color: G.graphite }}>{item.label}</span>
              <span style={{ ...TABULAR, fontSize: 13, fontWeight: 700, color: accent }}>
                +{prefix ?? ''}{item.value.toLocaleString()}{suffix ? ` ${suffix}` : ''}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  )
}
