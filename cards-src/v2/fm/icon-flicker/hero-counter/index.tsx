import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON, PALETTE as G } from '../../../tokens'
import { HeroCounter, type HeroCounterProps } from './cards'

const CONTENT: Record<string, Omit<HeroCounterProps, 'iconKey'>> = {
  cost: {
    eyebrow: 'Monthly bill',
    prefix: '$',
    from: 281,
    to: 244,
    pillText: '\u2193 $37 / mo',
  },
  savings: {
    eyebrow: 'Cumulative savings',
    iconColor: G.emerald,
    prefix: '$',
    duration: 9,
    sequence: [
      { value: 40, caption: 'MONTH 1' },
      { value: 120, caption: 'QUARTER 1' },
      { value: 240, caption: 'HALF YEAR' },
      { value: 480, caption: 'YEAR 1' },
    ],
    pillText: '+ $40 / mo locked in',
  },
  'hoa-catch': {
    eyebrow: 'Recovered YTD',
    iconColor: G.emerald,
    prefix: '$',
    duration: 9,
    sequence: [
      { value: 1240, caption: 'METER ERR' },
      { value: 3420, caption: '+ TIER MISS' },
      { value: 5800, caption: '+ TOU SLIP' },
      { value: 8420, caption: '+ DEMAND' },
    ],
    pillText: '12 wins flagged',
  },
}

export const HERO_COUNTER: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <HeroCounter {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
