/**
 * Pattern F — Step progress.
 *
 * Row of independent step nodes (no connector line). Each node activates
 * one-by-one with deliberate spacing, then the whole row holds in the "all
 * done" state for a beat before the cycle restarts. The wrapper opacity fades
 * out at the end so the snap back to "none done" isn't seen.
 */

import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion'
import { useEffect } from 'react'
import { Stage, HeaderRow, useMonotonicPhase, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

interface PipelineProps {
  steps: string[]
  accent: string
  phase: number
  /** Phase at which step 0 lights up. */
  fadeIn: number
  /** Phase distance between consecutive step activations. */
  stepGap: number
}

function Pipeline({ steps, accent, phase, fadeIn, stepGap }: PipelineProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        // Asymmetric padding (less on the left, more on the right) shifts the
        // row leftward to compensate for the right-leaning visual weight of the
        // down-right tilted labels. Tuned for the marketing-site cell width.
        paddingLeft: 14,
        paddingRight: 36,
      }}
    >
      {steps.map((label, i) => {
        const activeAt = fadeIn + i * stepGap
        const isDone = phase >= activeAt
        return <StepNode key={label} label={label} isDone={isDone} accent={accent} />
      })}
    </div>
  )
}

function StepNode({ label, isDone, accent }: { label: string; isDone: boolean; accent: string }) {
  // Drive a brief scale "pop" the moment isDone flips on, so each check feels
  // discrete instead of all-at-once.
  const scale = useMotionValue(1)
  useEffect(() => {
    if (isDone) {
      const ctrl = fmAnimate(scale, [0.85, 1.18, 1], { duration: 0.42, ease: [0.22, 1, 0.36, 1] })
      return () => ctrl.stop()
    }
    scale.set(1)
  }, [isDone, scale])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        animate={{
          background: isDone ? accent : 'rgba(255, 255, 255, 0.85)',
          borderColor: isDone ? accent : G.silver,
        }}
        transition={{ duration: 0.25 }}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: `2px solid ${G.silver}`,
          background: 'rgba(255, 255, 255, 0.85)',
          display: 'grid',
          placeItems: 'center',
          scale,
        }}
      >
        <svg viewBox="0 0 22 22" width="14" height="14" style={{ display: 'block' }}>
          <motion.path
            d="M6 11.5 L9.5 15 L16 8"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: isDone ? 1 : 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </motion.div>
      {/* Diagonal label: starts just below the checkbox and slants down-right
          at 45° so long words don't crowd the neighbouring node. */}
      <div style={{ position: 'relative', width: 0, height: 44, marginTop: 6 }}>
        <span
          style={{
            ...LABEL,
            fontSize: 7,
            color: isDone ? G.ink : G.graphite,
            whiteSpace: 'nowrap',
            transform: 'rotate(45deg)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            // Nudge slightly right so the text reads as starting under the
            // checkbox rather than to its left.
            left: 5,
            transition: 'color 0.25s',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export interface StepProgressProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  steps: string[]
  footnote?: string
  accent?: string
  duration?: number
}

export function StepProgressCard({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  steps,
  footnote,
  accent = G.emerald,
  duration,
}: StepProgressProps) {
  // Pace: 0.55s per step + 1.6s linger after last step + 0.4s fade-out.
  // For 4 steps this lands near 5.4s, which feels deliberate without dragging.
  const stepGapSeconds = 0.55
  const lingerSeconds = 1.6
  const fadeOutSeconds = 0.4
  const fadeInSeconds = 0.25
  const cycle = duration ?? steps.length * stepGapSeconds + lingerSeconds + fadeOutSeconds + fadeInSeconds
  const phase = useMonotonicPhase(cycle)
  const fadeIn = fadeInSeconds / cycle
  const stepGap = stepGapSeconds / cycle
  const fadeOutStart = 1 - fadeOutSeconds / cycle

  // Wrapper opacity: 0 → 1 over fade-in, hold at 1, 1 → 0 over fade-out. The
  // snap (all-done → none) at the cycle boundary happens under opacity 0.
  const wrapperOpacity =
    phase < fadeIn
      ? phase / fadeIn
      : phase >= fadeOutStart
      ? Math.max(0, 1 - (phase - fadeOutStart) / (1 - fadeOutStart))
      : 1

  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, opacity: wrapperOpacity }}>
        <Pipeline steps={steps} accent={accent} phase={phase} fadeIn={fadeIn} stepGap={stepGap} />
        {footnote && (
          <span style={{ ...TABULAR, fontSize: 11, color: G.graphite, fontWeight: 600 }}>{footnote}</span>
        )}
      </motion.div>
    </Stage>
  )
}
