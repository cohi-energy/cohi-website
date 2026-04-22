import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { GaugeCard, type GaugeProps } from './cards'

const CONTENT: Record<string, Omit<GaugeProps, 'iconKey'>> = {
  waste: {
    eyebrow: 'Equipment EER',
    fromValue: 28,
    toValue: 84,
    label: 'EFFICIENCY',
  },
  'retrofit-bulb': {
    eyebrow: 'Lighting efficiency',
    fromValue: 18,
    toValue: 92,
    label: 'LM/W RATING',
  },
  'retrofit-balance': {
    eyebrow: 'ROI match',
    fromValue: 32,
    toValue: 89,
    label: 'PORTFOLIO ROI',
  },
}

export const GAUGE: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <GaugeCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
