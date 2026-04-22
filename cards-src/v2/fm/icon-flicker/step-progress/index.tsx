import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { StepProgressCard, type StepProgressProps } from './cards'

const CONTENT: Record<string, Omit<StepProgressProps, 'iconKey'>> = {
  compliance: {
    eyebrow: 'Compliance flow',
    steps: ['AUTHORIZATION', 'PROCESSING', 'FILING', 'APPROVAL'],
    footnote: 'Filed ahead of cutoff',
  },
  'compliance-scan': {
    eyebrow: 'Reg sweep',
    steps: ['AUTHORIZATION', 'PROCESSING', 'FILING', 'APPROVAL'],
    footnote: '0 violations after sweep',
  },
  'benchmark-mail': {
    eyebrow: 'Submission pipeline',
    steps: ['AUTHORIZATION', 'PROCESSING', 'FILING', 'APPROVAL'],
    footnote: 'Receipt #88421 \u00b7 stress free',
  },
}

export const STEP_PROGRESS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <StepProgressCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
