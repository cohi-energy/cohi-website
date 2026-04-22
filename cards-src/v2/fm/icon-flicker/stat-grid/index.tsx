import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON, PALETTE as G } from '../../../tokens'
import { StatGridCard, type StatGridProps } from './cards'

const CONTENT: Record<string, Omit<StatGridProps, 'iconKey'>> = {
  savings: {
    eyebrow: 'Savings summary',
    stats: [
      { value: '$480', label: 'Saved / yr', accent: G.emeraldDeep },
      { value: '$40', label: 'Saved / mo' },
      { value: '13%', label: 'Off bill', accent: G.emeraldDeep },
      { value: '6 mo', label: 'To subscription' },
    ],
  },
  'incentive-scan': {
    eyebrow: 'Programs matched',
    stats: [
      { value: '$2.4k', label: 'Annual savings', accent: G.emeraldDeep },
      { value: '3', label: 'Programs ready' },
      { value: '12 mo', label: 'Payback' },
      { value: '87%', label: 'Match score', accent: G.emeraldDeep },
    ],
  },
  'retrofit-bulb': {
    eyebrow: 'Retrofit summary',
    stats: [
      { value: '\u221234%', label: 'kWh', accent: G.emeraldDeep },
      { value: '0.9 yr', label: 'Payback' },
      { value: '$1.2k', label: 'Upfront' },
      { value: '4.2\u00d7', label: 'ROI', accent: G.emeraldDeep },
    ],
  },
}

export const STAT_GRID: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <StatGridCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
