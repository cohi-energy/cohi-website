/**
 * Pattern E — Comparison ladder.
 *
 * 3-4 horizontal bars representing options. Winner highlighted with a leftmost
 * ★. Cycle is short (~3.5s): wrapper fades in, rows enter staggered, ★ pops on
 * the winner, the resolved state holds, then the wrapper fades out so the
 * snap back to "no rows" isn't seen.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, useMonotonicPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface Option {
  label: string
  value: number
  winner?: boolean
}

function ComparisonRow({
  option,
  max,
  accent,
  formatValue,
  enter,
  starOn,
}: {
  option: Option
  max: number
  accent: string
  formatValue: (v: number) => string
  enter: boolean
  starOn: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: enter ? 1 : 0, x: enter ? 0 : -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        display: 'grid',
        // Star (12px) → label (56px) → bar (1fr) → value (auto). Star sits in
        // its own column so it can never overlap the value text or neighbours.
        gridTemplateColumns: '12px 56px 1fr auto',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <motion.span
        initial={false}
        animate={{ opacity: starOn ? 1 : 0, scale: starOn ? 1 : 0.6 }}
        transition={{ duration: 0.25 }}
        style={{
          ...TABULAR,
          fontSize: 12,
          fontWeight: 700,
          color: accent,
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        ★
      </motion.span>
      <span style={{ ...LABEL, fontSize: 9, color: option.winner ? accent : G.graphite }}>{option.label}</span>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ scaleX: enter ? Math.max(0.04, option.value / max) : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            background: option.winner ? `linear-gradient(90deg, ${G.emerald}, ${G.emeraldDeep})` : G.graphite,
            transformOrigin: 'left center',
            borderRadius: 4,
            boxShadow: starOn ? `0 0 0 2px ${G.emerald}33` : 'none',
          }}
        />
      </div>
      <span
        style={{
          ...TABULAR,
          fontSize: 12,
          fontWeight: 700,
          color: option.winner ? accent : G.ink,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {formatValue(option.value)}
      </span>
    </motion.div>
  )
}

export interface ComparisonProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  items: Option[]
  unit?: string
  prefix?: string
  suffix?: string
  accent?: string
  formatValue?: (v: number) => string
  duration?: number
}

export function ComparisonCard({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  items,
  prefix = '',
  suffix = '',
  accent = G.emeraldDeep,
  formatValue,
  duration = 3.6,
}: ComparisonProps) {
  // Tight cycle. Stagger=0.18s between row entries means a 4-row card lands
  // its last row at ~0.72s; the ★ then appears and stays through fade-out.
  const stagger = 0.18
  const fadeIn = 0.25
  const fadeOut = 0.35
  const phase = useMonotonicPhase(duration)
  const tSec = phase * duration

  const rowEnter = (i: number) => tSec >= fadeIn + i * stagger && tSec < duration - fadeOut * 0.4
  // ★ appears one stagger after the last row, then holds through the rest of
  // the visible window — including the fade-out tail — so it can't flash.
  const starOn = (winner: boolean) => winner && tSec >= fadeIn + items.length * stagger && tSec < duration - fadeOut * 0.4

  // Wrapper fade-in / hold / fade-out so the snap from "all-resolved" back to
  // "no rows" at the cycle boundary happens under opacity 0.
  const wrapperOpacity =
    tSec < fadeIn
      ? tSec / fadeIn
      : tSec >= duration - fadeOut
      ? Math.max(0, 1 - (tSec - (duration - fadeOut)) / fadeOut)
      : 1

  const max = Math.max(...items.map((i) => i.value))
  const fmt = formatValue ?? ((v: number) => `${prefix}${v}${suffix}`)
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'center', opacity: wrapperOpacity }}
      >
        {items.map((opt, i) => (
          <ComparisonRow
            key={opt.label}
            option={opt}
            max={max}
            accent={accent}
            formatValue={fmt}
            enter={rowEnter(i)}
            starOn={starOn(!!opt.winner)}
          />
        ))}
      </motion.div>
    </Stage>
  )
}
