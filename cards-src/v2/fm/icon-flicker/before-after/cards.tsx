/**
 * Pattern K — Before / After pair.
 * Two stat tiles with a delta arrow between.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useLoopingPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface Side {
  value: string
  unit?: string
  label: string
}

export interface BeforeAfterProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  before: Side
  after: Side
  deltaText: string
  accent?: string
}

function Pair({ before, after, deltaText, accent }: { before: Side; after: Side; deltaText: string; accent: string }) {
  const phase = useLoopingPhase(4)
  const showAfter = phase >= 0.35
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <span style={{ ...LABEL, fontSize: 8, color: G.graphite }}>{before.label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span
            style={{
              ...TABULAR,
              fontSize: 'clamp(28px, 7cqi, 44px)',
              fontWeight: 700,
              color: G.silver,
              lineHeight: 1,
              textDecoration: 'line-through',
              textDecorationColor: G.silver,
              textDecorationThickness: 2,
            }}
          >
            {before.value}
          </span>
          {before.unit && <span style={{ ...TABULAR, fontSize: 11, color: G.silver, fontWeight: 600 }}>{before.unit}</span>}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: showAfter ? 1 : 0, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
      >
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12 L19 12 M14 6 L19 12 L14 18" />
        </svg>
        <span style={{ ...LABEL, fontSize: 7, color: accent }}>{deltaText}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: showAfter ? 1 : 0, y: showAfter ? 0 : 6 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, alignItems: 'flex-end', textAlign: 'right' }}
      >
        <span style={{ ...LABEL, fontSize: 8, color: accent }}>{after.label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ ...TABULAR, fontSize: 'clamp(28px, 7cqi, 44px)', fontWeight: 700, color: G.ink, lineHeight: 1 }}>
            {after.value}
          </span>
          {after.unit && <span style={{ ...TABULAR, fontSize: 11, color: G.graphite, fontWeight: 600 }}>{after.unit}</span>}
        </div>
      </motion.div>
    </div>
  )
}

export function BeforeAfterCard({ eyebrow, iconKey, iconColor = G.emerald, before, after, deltaText, accent = G.emeraldDeep }: BeforeAfterProps) {
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <Pair before={before} after={after} deltaText={deltaText} accent={accent} />
    </Stage>
  )
}
