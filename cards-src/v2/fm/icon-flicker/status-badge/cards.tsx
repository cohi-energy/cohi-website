/**
 * Pattern L — Status badge.
 * One big state marker (✓ Compliant · ● Live · ✓ Submitted) with one supporting line.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useLoopingPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

export interface StatusBadgeProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  symbol: string
  primary: string
  secondary: string
  color?: string
  bg?: string
  pulse?: boolean
}

function PulsingBadge({ symbol, primary, secondary, color, bg }: Required<Pick<StatusBadgeProps, 'symbol' | 'primary' | 'secondary' | 'color' | 'bg'>>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: bg }}
        />
        <div
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: bg,
            color,
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
            boxShadow: `0 0 0 4px ${bg}22`,
          }}
        >
          {symbol}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ ...TABULAR, fontSize: 'clamp(20px, 5cqi, 32px)', fontWeight: 700, color: G.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {primary}
        </span>
        <span style={{ ...LABEL, fontSize: 8, color: G.graphite, marginTop: 2, whiteSpace: 'nowrap' }}>{secondary}</span>
      </div>
    </div>
  )
}

function FadeInBadge({ symbol, primary, secondary, color, bg }: Required<Pick<StatusBadgeProps, 'symbol' | 'primary' | 'secondary' | 'color' | 'bg'>>) {
  const phase = useLoopingPhase(4)
  const visible = phase >= 0.15
  const settled = phase >= 0.5
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: visible ? 1 : 0.5, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: bg,
          color,
          display: 'grid',
          placeItems: 'center',
          fontSize: 30,
          fontWeight: 700,
          boxShadow: settled ? `0 0 0 4px ${bg}22` : 'none',
          transition: 'box-shadow 0.4s',
        }}
      >
        {symbol}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
      >
        <span style={{ ...TABULAR, fontSize: 'clamp(20px, 5cqi, 32px)', fontWeight: 700, color: G.ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {primary}
        </span>
        <span style={{ ...LABEL, fontSize: 8, color: G.graphite, marginTop: 2, whiteSpace: 'nowrap' }}>{secondary}</span>
      </motion.div>
    </div>
  )
}

export function StatusBadgeCard({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  symbol,
  primary,
  secondary,
  color = 'white',
  bg = G.emerald,
  pulse = false,
}: StatusBadgeProps) {
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      {pulse ? (
        <PulsingBadge symbol={symbol} primary={primary} secondary={secondary} color={color} bg={bg} />
      ) : (
        <FadeInBadge symbol={symbol} primary={primary} secondary={secondary} color={color} bg={bg} />
      )}
    </Stage>
  )
}
