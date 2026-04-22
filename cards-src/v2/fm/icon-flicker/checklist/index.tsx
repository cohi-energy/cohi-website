import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { ChecklistCard, type ChecklistProps } from './cards'

const CONTENT: Record<string, Omit<ChecklistProps, 'iconKey'>> = {
  compliance: {
    eyebrow: 'Compliance · open items',
    items: [
      { label: 'Title 24 filed', sub: '\u2713 5/14' },
      { label: 'CARB submission', sub: '\u2713 ahead of cutoff' },
      { label: 'Meter audit cleared', sub: 'no open issues' },
    ],
    pillText: 'All clear',
  },
  'incentive-scan': {
    eyebrow: 'Incentives matched',
    items: [
      { label: 'CARE eligible', sub: '32% bill discount' },
      { label: 'TECH grant', sub: 'up to $1,800' },
      { label: 'PG&E rebate', sub: '$640 instant' },
    ],
    pillText: '+ $2.4k / yr',
  },
  'retrofit-bulb': {
    eyebrow: 'Retrofit kit',
    items: [
      { label: 'LED swap', sub: '\u221287% W' },
      { label: 'Daylight sensor', sub: '\u221212% hrs' },
      { label: 'Dimmable circuits', sub: '\u22128% peak' },
    ],
    pillText: '\u2193 34% kWh',
  },
  'compliance-scan': {
    eyebrow: 'Reg sweep · today',
    items: [
      { label: 'BERDO update', sub: 'pulled 4:02p' },
      { label: 'LL97 deadline', sub: '142 days out' },
      { label: 'Title 24 patch', sub: 'no impact' },
    ],
    pillText: 'Audit ready',
  },
  'benchmark-mail': {
    eyebrow: 'Submission packet',
    items: [
      { label: 'Energy Star captured', sub: '12 mo data' },
      { label: 'Building data verified', sub: 'sq ft \u2713' },
      { label: 'Packet sealed', sub: 'ready to file' },
    ],
    pillText: 'On time',
  },
}

export const CHECKLIST: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <ChecklistCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
