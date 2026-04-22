import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON, PALETTE as G } from '../../../tokens'
import { SparklineCard, type SparklineProps } from './cards'

const CONTENT: Record<string, Omit<SparklineProps, 'iconKey'>> = {
  waste: {
    eyebrow: 'EER · 12 mo',
    suffix: 'EER',
    from: 8.4,
    to: 11.6,
    format: (n) => n.toFixed(1),
    before: [10.8, 10.6, 10.4, 10.1, 9.9, 9.7, 9.5, 9.3, 9.0, 8.8, 8.6, 8.4],
    after: [10.8, 10.8, 10.8, 10.8, 11.0, 11.2, 11.4, 11.5, 11.5, 11.6, 11.6, 11.6],
    beforeColor: G.amber,
  },
  'usage-boulder': {
    eyebrow: 'Peak window',
    suffix: 'hr',
    from: 4,
    to: 1,
    before: [12, 28, 18, 56, 78, 84, 62, 38, 26, 18, 14, 10],
    after: [22, 24, 26, 30, 34, 38, 36, 32, 30, 28, 26, 24],
    beforeColor: G.rose,
  },
}

export const SPARKLINE: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <SparklineCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
