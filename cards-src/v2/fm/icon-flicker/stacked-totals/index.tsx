import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { StackedTotalsCard, type StackedTotalsProps } from './cards'

const CONTENT: Record<string, Omit<StackedTotalsProps, 'iconKey'>> = {
  savings: {
    eyebrow: 'Annual savings · stack',
    items: [
      { label: 'TOU SHIFT', value: 220 },
      { label: 'STANDBY', value: 140 },
      { label: 'BASELINE FIX', value: 120 },
    ],
  },
  'bill-crush': {
    eyebrow: 'Where the $37 comes from',
    items: [
      { label: 'TOU SHIFT', value: 22 },
      { label: 'DEMAND', value: 9 },
      { label: 'TIER FIX', value: 6 },
    ],
  },
  'hoa-catch': {
    eyebrow: 'Recovered YTD',
    items: [
      { label: 'METER ERR', value: 1240 },
      { label: 'TIER MISS', value: 920 },
      { label: 'TOU MISS', value: 680 },
      { label: 'DEMAND', value: 580 },
    ],
  },
}

export const STACKED_TOTALS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <StackedTotalsCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
