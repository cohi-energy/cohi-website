import type { ComponentType } from 'react'
import { CARD_EYEBROW, CARD_ICON } from '../../../tokens'
import { HeatGridCard, type HeatGridProps } from './cards'

const CONTENT: Record<string, Omit<HeatGridProps, 'iconKey'>> = {
  'usage-boulder': {
    eyebrow: 'Load grid \u00b7 7\u00d724',
  },
}

export const HEAT_GRID: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(CONTENT).map(([cardId, props]) => [
    cardId,
    () => <HeatGridCard {...props} iconKey={CARD_ICON[cardId]} eyebrow={CARD_EYEBROW[cardId] ?? props.eyebrow} />,
  ])
)
