/**
 * Pattern D — Status checklist.
 *
 * Vertical list of items, each landing on a fixed beat. After the last check
 * lands, one more beat passes, then the pill appears, lingers for one beat,
 * and the wrapper fades out before the cycle restarts. So everything in the
 * card — checks AND pill — moves on the same metronome.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, Pill, useMonotonicPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface ChecklistItem {
  label: string
  sub?: string
}

function CheckRow({ item, isDone }: { item: ChecklistItem; isDone: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 18, height: 18 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 5,
            background: 'rgba(15, 23, 42, 0.06)',
            border: `1.5px solid ${G.silver}`,
          }}
        />
        <motion.div
          style={{ position: 'absolute', inset: 0, borderRadius: 5, background: G.emerald }}
          initial={false}
          animate={{ opacity: isDone ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />
        <svg viewBox="0 0 18 18" width="18" height="18" style={{ position: 'absolute', inset: 0 }}>
          {/* Snap opacity to 1 at the moment the check starts drawing so the
              rounded stroke cap can't render its starting dot prematurely. */}
          <motion.path
            d="M4 9.5 L7.5 13 L14 6"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: isDone ? 1 : 0, opacity: isDone ? 1 : 0 }}
            transition={{
              pathLength: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.05 },
            }}
          />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ ...TABULAR, fontSize: 12, fontWeight: 600, color: G.ink, letterSpacing: '-0.02em' }}>
          {item.label}
        </span>
        {item.sub && <span style={{ ...LABEL, fontSize: 8, color: G.graphite }}>{item.sub}</span>}
      </div>
    </div>
  )
}

export interface ChecklistProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  items: ChecklistItem[]
  pillText?: string
}

export function ChecklistCard({ eyebrow, iconKey, iconColor = G.emerald, items, pillText }: ChecklistProps) {
  // Single beat that controls the entire card. With stagger=1.2s the cycle
  // for 3 items + 1 pill beat + 1 linger beat lands near 6.6s.
  const stagger = 1.2 // seconds between landings
  const fadeOut = 0.5 // wrapper fade-out tail at end of cycle
  const N = items.length
  // Beats: item 0 lands at 1*stagger, item 1 at 2*stagger, ..., item N-1 at
  // N*stagger. Pill lands at (N+1)*stagger and lingers one stagger before the
  // fade-out begins.
  const cycle = (N + 2) * stagger + fadeOut
  const phase = useMonotonicPhase(cycle)
  const tSec = phase * cycle

  // Items stay checked from when they land until the wrapper begins fading
  // out. The pill follows the exact same beat pattern: it appears one stagger
  // after the last check lands and stays for exactly one stagger before the
  // wrapper fade begins (so "wait" and "linger" are the same length).
  const itemDone = (i: number) => tSec >= (i + 1) * stagger && tSec < cycle - fadeOut
  const pillVisible = !!pillText && tSec >= (N + 1) * stagger && tSec < (N + 2) * stagger

  // Wrapper opacity: hold at 1, then fade out over the last `fadeOut` seconds.
  // Snap-back to "all empty + no pill" happens during the invisible window.
  const wrapperOpacity =
    tSec >= cycle - fadeOut ? Math.max(0, 1 - (tSec - (cycle - fadeOut)) / fadeOut) : 1

  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, justifyContent: 'center', opacity: wrapperOpacity }}
      >
        {items.map((item, i) => (
          <CheckRow key={item.label} item={item} isDone={itemDone(i)} />
        ))}
      </motion.div>
      {pillText && <Pill visible={pillVisible}>{pillText}</Pill>}
    </Stage>
  )
}
