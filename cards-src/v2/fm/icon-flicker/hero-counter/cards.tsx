/**
 * Pattern A — Hero counter.
 * Big tabular number that either ticks from→to or walks through a sequence of
 * named waypoints (e.g. month 1 → month 3 → month 6 → year 1 savings). A delta
 * pill optionally appears once we've reached the final state.
 */

import { motion } from 'framer-motion'
import { Stage, HeaderRow, Pill, useLoopingNumber, useLoopingSequence, TABULAR, LABEL, PALETTE as G, Icon, type IconKey } from '../shared'

export interface HeroCounterProps {
  eyebrow: string
  iconKey: IconKey
  iconColor?: string
  prefix?: string
  suffix?: string
  /** Simple from→to animation. Required unless `sequence` is provided. */
  from?: number
  to?: number
  /** Walk through a list of named waypoints (rotating caption underneath). */
  sequence?: { value: number; caption: string }[]
  duration?: number
  pillText?: string
  pillTone?: 'positive' | 'negative' | 'neutral'
  format?: (n: number) => string
}

export function HeroCounter({
  eyebrow,
  iconKey,
  iconColor = G.emerald,
  prefix,
  suffix,
  from,
  to,
  sequence,
  duration,
  pillText,
  pillTone = 'positive',
  format,
}: HeroCounterProps) {
  if (sequence && sequence.length >= 2) {
    return (
      <SequenceVariant
        eyebrow={eyebrow}
        iconKey={iconKey}
        iconColor={iconColor}
        prefix={prefix}
        suffix={suffix}
        sequence={sequence}
        duration={duration ?? 8}
        pillText={pillText}
        pillTone={pillTone}
        format={format}
      />
    )
  }
  return (
    <SimpleVariant
      eyebrow={eyebrow}
      iconKey={iconKey}
      iconColor={iconColor}
      prefix={prefix}
      suffix={suffix}
      from={from ?? 0}
      to={to ?? 0}
      duration={duration ?? 4}
      pillText={pillText}
      pillTone={pillTone}
      format={format}
    />
  )
}

function SimpleVariant({
  eyebrow,
  iconKey,
  iconColor,
  prefix,
  suffix,
  from,
  to,
  duration,
  pillText,
  pillTone,
  format,
}: Required<Pick<HeroCounterProps, 'eyebrow' | 'iconKey' | 'iconColor' | 'from' | 'to' | 'duration' | 'pillTone'>> &
  Pick<HeroCounterProps, 'prefix' | 'suffix' | 'pillText' | 'format'>) {
  const value = useLoopingNumber(from, to, duration)
  const range = Math.abs(to - from) || 1
  const progress = Math.abs(value - from) / range
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <BigNumber value={value} prefix={prefix} suffix={suffix} format={format} />
      {pillText && <Pill visible={progress >= 0.85} tone={pillTone}>{pillText}</Pill>}
    </Stage>
  )
}

function SequenceVariant({
  eyebrow,
  iconKey,
  iconColor,
  prefix,
  suffix,
  sequence,
  duration,
  pillText,
  pillTone,
  format,
}: Required<Pick<HeroCounterProps, 'eyebrow' | 'iconKey' | 'iconColor' | 'duration' | 'pillTone'>> &
  Pick<HeroCounterProps, 'prefix' | 'suffix' | 'pillText' | 'format'> & { sequence: NonNullable<HeroCounterProps['sequence']> }) {
  const values = sequence.map((s) => s.value)
  const { value, opacity, index } = useLoopingSequence(values, duration)
  const caption = sequence[index].caption
  const isFinal = index === sequence.length - 1
  return (
    <Stage>
      <HeaderRow eyebrow={eyebrow} icon={<Icon name={iconKey} color={iconColor} />} />
      <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 2, opacity }}>
        <BigNumber value={value} prefix={prefix} suffix={suffix} format={format} />
        <span style={{ ...LABEL, fontSize: 9, color: G.graphite, marginTop: 2 }}>{caption}</span>
      </motion.div>
      {pillText && <Pill visible={isFinal && opacity > 0.95} tone={pillTone}>{pillText}</Pill>}
    </Stage>
  )
}

function BigNumber({ value, prefix, suffix, format }: { value: number; prefix?: string; suffix?: string; format?: (n: number) => string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      {prefix && (
        <span style={{ ...TABULAR, fontSize: 22, color: G.graphite, fontWeight: 600 }}>{prefix}</span>
      )}
      <span style={{ ...TABULAR, fontSize: 'clamp(44px, 11cqi, 80px)', fontWeight: 700, color: G.ink, lineHeight: 1 }}>
        {format ? format(value) : value.toLocaleString()}
      </span>
      {suffix && (
        <span style={{ ...TABULAR, fontSize: 14, color: G.graphite, fontWeight: 600, marginLeft: 4 }}>{suffix}</span>
      )}
    </div>
  )
}
