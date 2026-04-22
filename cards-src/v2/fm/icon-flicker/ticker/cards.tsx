/**
 * Pattern G — Live ticker.
 * Streaming activity log; events appear with timestamps. Each event becomes
 * the newest visible for an equal slice of the cycle, then the entire feed
 * fades out smoothly before snapping back to the empty state for the next loop.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Stage, useMonotonicPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface Event {
  time: string
  text: string
  emphasis?: string
}

function LiveDot({ color }: { color: string }) {
  // Three rings, evenly staggered. Each ring's opacity starts AND ends at 0 so
  // the loop restart (back to scale 1) is invisible — eliminates the snap that
  // earlier two-ring versions still showed.
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 8, height: 8 }}>
      {[0, 0.6, 1.2].map((delay) => (
        <motion.span
          key={delay}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 2.8], opacity: [0, 0.55, 0] }}
          transition={{
            duration: 1.8,
            times: [0, 0.25, 1],
            repeat: Infinity,
            ease: 'easeOut',
            delay,
          }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}
        />
      ))}
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
    </span>
  )
}

function Feed({ events, accent, duration, fadeOutSeconds = 0.5 }: { events: Event[]; accent: string; duration: number; fadeOutSeconds?: number }) {
  const phase = useMonotonicPhase(duration)
  const N = events.length
  // Each event gets equal "focal" time. The fade-out window is small (~500ms)
  // so the resolved feed doesn't linger before the loop restarts.
  const fadeStart = Math.max(0.6, 1 - fadeOutSeconds / duration)
  const focal = fadeStart / N
  let visibleCount: number
  let feedOpacity: number
  if (phase < fadeStart) {
    visibleCount = Math.min(N, Math.floor(phase / focal) + 1)
    feedOpacity = 1
  } else {
    visibleCount = N
    const fadeLen = 1 - fadeStart
    feedOpacity = Math.max(0, 1 - (phase - fadeStart) / fadeLen)
  }
  const visible = events.slice(0, visibleCount)
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'flex-end', paddingBottom: 4, opacity: feedOpacity }}
    >
      <AnimatePresence initial={false}>
        {visible.map((event, i) => (
          <motion.div
            key={`${i}-${event.text}`}
            initial={{ opacity: 0, x: -8, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 10, alignItems: 'baseline' }}
          >
            <span style={{ ...TABULAR, fontSize: 11, color: G.silver, fontWeight: 600 }}>{event.time}</span>
            <span style={{ ...TABULAR, fontSize: 13, color: G.ink, lineHeight: 1.35 }}>
              {event.text}
              {event.emphasis && (
                <strong style={{ color: accent, fontWeight: 700, marginLeft: 4 }}>{event.emphasis}</strong>
              )}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export interface TickerProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  events: Event[]
  accent?: string
  duration?: number
}

export function TickerCard({ eyebrow, iconKey, iconColor = G.emerald, events, accent = G.emeraldDeep, duration }: TickerProps) {
  // Pace the cycle so each event gets ~1.8s as the newest line. Fade-out is a
  // crisp ~0.5s tail so the resolved feed doesn't linger before the next loop.
  const fadeOutSeconds = 0.5
  const cycle = duration ?? events.length * 1.8 + fadeOutSeconds
  return (
    <Stage>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...LABEL, fontSize: 10, color: G.graphite, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <LiveDot color={accent} />
          {eyebrow}
        </span>
        <Icon name={iconKey} color={iconColor} />
      </div>
      <Feed events={events} accent={accent} duration={cycle} fadeOutSeconds={fadeOutSeconds} />
    </Stage>
  )
}
