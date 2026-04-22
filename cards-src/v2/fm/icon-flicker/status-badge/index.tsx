import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { StatusBadgeCard, type StatusBadgeProps } from './cards'

const CONTENT: Record<string, Omit<StatusBadgeProps, 'iconKey'>> = {
  compliance: {
    eyebrow: 'Compliance status',
    symbol: '\u2713',
    primary: 'Compliant',
    secondary: 'all filings current',
  },
  'usage-boulder': {
    eyebrow: 'Usage monitor',
    symbol: '\u25cf',
    primary: 'Smoothed',
    secondary: '1 hr peak window \u00b7 live',
    pulse: true,
  },
  'benchmark-mail': {
    eyebrow: 'Submission status',
    symbol: '\u2713',
    primary: 'Submitted',
    secondary: 'Filed Mar 14 \u00b7 receipt #88421',
  },
}

export const STATUS_BADGE: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <StatusBadgeCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
