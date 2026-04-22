import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { ComparisonCard, type ComparisonProps } from './cards'

const CONTENT: Record<string, Omit<ComparisonProps, 'iconKey'>> = {
  cost: {
    eyebrow: 'Rate plan match',
    items: [
      { label: 'E-1', value: 312 },
      { label: 'E-TOU-C', value: 281 },
      { label: 'EV-A', value: 244, winner: true },
      { label: 'E-TOU-B', value: 268 },
    ],
    formatValue: (v) => `$${v}`,
  },
  'bill-crush': {
    eyebrow: 'Plans \u00b7 monthly $',
    items: [
      { label: 'CURRENT', value: 281 },
      { label: 'EV-A', value: 244, winner: true },
      { label: 'TOU-C', value: 268 },
      { label: 'TIER 5', value: 312 },
    ],
    formatValue: (v) => `$${v}`,
  },
  'retrofit-balance': {
    eyebrow: 'Retrofit ROI',
    items: [
      { label: 'LED', value: 4.2, winner: true },
      { label: 'HEAT PUMP', value: 3.1 },
      { label: 'INSULATE', value: 2.4 },
      { label: 'WINDOWS', value: 1.6 },
    ],
    formatValue: (v) => `${v}\u00d7`,
  },
}

export const COMPARISON: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <ComparisonCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
