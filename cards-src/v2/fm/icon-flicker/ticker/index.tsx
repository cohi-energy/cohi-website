import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { TickerCard, type TickerProps } from './cards'

const CONTENT: Record<string, Omit<TickerProps, 'iconKey'>> = {
  'incentive-scan': {
    eyebrow: 'Live incentive scan',
    events: [
      { time: '09:00', text: 'Scanning IRA + state grants' },
      { time: '09:00', text: 'PG&E rebate matched' },
      { time: '09:01', text: 'CARE qualification confirmed' },
    ],
  },
  'hoa-catch': {
    eyebrow: 'Anomaly feed',
    events: [
      { time: '11:18', text: 'Meter calibration off by 4%' },
      { time: '11:19', text: 'Tier rollover missed (Bldg C)' },
      { time: '11:20', text: 'Demand spike anomaly (Bldg A)' },
      { time: '11:21', text: 'TOU window slipped (Bldg B)' },
      { time: '11:22', text: 'Total caught:', emphasis: '$8.4k YTD' },
    ],
  },
  'compliance-scan': {
    eyebrow: 'Live reg sweep',
    events: [
      { time: '13:42', text: 'Pulling LADWP rules' },
      { time: '13:43', text: 'BERDO Title 24 update' },
      { time: '13:44', text: 'LL97 deadline check' },
      { time: '13:44', text: 'CARB Form 2 filing window open' },
      { time: '13:45', text: 'All clear:', emphasis: 'audit ready' },
    ],
  },
}

export const TICKER: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <TickerCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
