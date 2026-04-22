/**
 * Pattern H — Heat grid.
 * 7×24 day-hour grid that walks evenly through five states — baseline →
 * pre-cool flagged → engaged → trimmed → smoothed. Each stage gets equal
 * dwell time, and the wrapper opacity fades out at the end so the snap back
 * to baseline isn't seen.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useMonotonicPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface PhaseState {
  caption: string
  /** hours coloured rose (peak) */
  peakHours: number[]
  /** hours coloured emerald (pre-cool intervention) */
  precoolHours: number[]
  /** hours coloured amber (mid load) */
  midHours: number[]
}

const STAGES: PhaseState[] = [
  {
    caption: 'Baseline · 4 hr peak (4–8 PM)',
    peakHours: [16, 17, 18, 19],
    precoolHours: [],
    midHours: [10, 11, 12, 13, 14, 15, 20, 21],
  },
  {
    caption: 'Pre-cool window flagged · 11 AM',
    peakHours: [16, 17, 18, 19],
    precoolHours: [11],
    midHours: [10, 12, 13, 14, 15, 20, 21],
  },
  {
    caption: 'Pre-cool engaged · peak trimmed to 3 hr',
    peakHours: [17, 18, 19],
    precoolHours: [10, 11],
    midHours: [12, 13, 14, 15, 16, 20, 21],
  },
  {
    caption: 'Demand shaved · 2 hr peak',
    peakHours: [17, 18],
    precoolHours: [10, 11],
    midHours: [12, 13, 14, 15, 16, 19, 20, 21],
  },
  {
    caption: 'Smoothed · 1 hr peak · 5 PM',
    peakHours: [17],
    precoolHours: [10, 11],
    midHours: [12, 13, 14, 15, 16, 18, 19, 20, 21],
  },
]

export interface HeatGridProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  duration?: number
}

export function HeatGridCard({ eyebrow, iconKey, iconColor = G.emerald, duration = 7 }: HeatGridProps) {
  const phase = useMonotonicPhase(duration)
  const N = STAGES.length
  const fadeIn = 0.04
  const fadeOut = 0.05
  const walkLen = 1 - fadeIn - fadeOut
  // Baseline stays visible for ~2s (its dwell PLUS the wrapper fade-in tail).
  // With duration=7, fadeIn=0.04, and weight=1.5: baseline visible total ≈
  // 0.28s fade-in + 1.74s walk = 2.02s; each of the four optimisation stages
  // gets ≈ 1.16s.
  const firstStageWeight = 1.5
  const totalUnits = firstStageWeight + (N - 1)
  const unitLen = walkLen / totalUnits
  const firstStageEnd = fadeIn + unitLen * firstStageWeight

  let stage: PhaseState
  let opacity: number
  if (phase < fadeIn) {
    stage = STAGES[0]
    opacity = phase / fadeIn
  } else if (phase >= 1 - fadeOut) {
    stage = STAGES[N - 1]
    opacity = Math.max(0, 1 - (phase - (1 - fadeOut)) / fadeOut)
  } else if (phase < firstStageEnd) {
    stage = STAGES[0]
    opacity = 1
  } else {
    const t = (phase - firstStageEnd) / (1 - firstStageEnd - fadeOut)
    const idx = Math.min(N - 1, 1 + Math.floor(t * (N - 1)))
    stage = STAGES[idx]
    opacity = 1
  }

  const days = 7
  const hours = 24
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, opacity }}>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${hours}, 1fr)`,
            gridTemplateRows: `repeat(${days}, 1fr)`,
            gap: 1,
            maxHeight: 96,
          }}
        >
          {Array.from({ length: days * hours }).map((_, i) => {
            const hr = i % hours
            let color: string
            if (stage.peakHours.includes(hr)) color = G.rose
            else if (stage.precoolHours.includes(hr)) color = G.emerald
            else if (stage.midHours.includes(hr)) color = `${G.amber}88`
            else color = `${G.emerald}1f`
            return (
              <motion.div
                key={i}
                animate={{ background: color }}
                transition={{ duration: 0.45 }}
                style={{ borderRadius: 1 }}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...LABEL, fontSize: 8, color: G.graphite }}>MON</span>
          <span style={{ ...LABEL, fontSize: 8, color: G.graphite }}>SUN</span>
        </div>
        <span style={{ ...TABULAR, fontSize: 11, color: G.graphite, fontWeight: 600 }}>{stage.caption}</span>
      </motion.div>
    </Stage>
  )
}
