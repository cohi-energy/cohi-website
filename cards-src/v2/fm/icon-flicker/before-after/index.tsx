import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { BeforeAfterCard, type BeforeAfterProps } from './cards'

const CONTENT: Record<string, Omit<BeforeAfterProps, 'iconKey'>> = {
  cost: {
    eyebrow: 'Monthly bill',
    before: { value: '$281', label: 'BEFORE' },
    after: { value: '$244', label: 'AFTER' },
    deltaText: '\u2212$37',
  },
  waste: {
    eyebrow: 'Equipment EER',
    before: { value: '8.4', unit: 'EER', label: 'OLD' },
    after: { value: '11.6', unit: 'EER', label: 'NEW' },
    deltaText: '+38%',
  },
  'bill-crush': {
    eyebrow: 'Before / after switch',
    before: { value: '$281', label: 'CURRENT' },
    after: { value: '$244', label: 'EV-A' },
    deltaText: '\u2212$37',
  },
  'retrofit-balance': {
    eyebrow: 'Payback period',
    before: { value: '4.2', unit: 'yr', label: 'PRIOR' },
    after: { value: '0.9', unit: 'yr', label: 'OPTIMAL' },
    deltaText: '\u221279%',
  },
}

export const BEFORE_AFTER: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <BeforeAfterCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
