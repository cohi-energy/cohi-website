import type { ComponentType } from 'react'
import { HERO_COUNTER } from './hero-counter'
import { SPARKLINE } from './sparkline'
import { STACKED_TOTALS } from './stacked-totals'
import { CHECKLIST } from './checklist'
import { COMPARISON } from './comparison'
import { STEP_PROGRESS } from './step-progress'
import { TICKER } from './ticker'
import { HEAT_GRID } from './heat-grid'
import { GAUGE } from './gauge'
import { STAT_GRID } from './stat-grid'
import { BEFORE_AFTER } from './before-after'
import { STATUS_BADGE } from './status-badge'

export const SHARP_ICON_DATA = {
  heroCounter: HERO_COUNTER,
  sparkline: SPARKLINE,
  stackedTotals: STACKED_TOTALS,
  checklist: CHECKLIST,
  comparison: COMPARISON,
  stepProgress: STEP_PROGRESS,
  ticker: TICKER,
  heatGrid: HEAT_GRID,
  gauge: GAUGE,
  statGrid: STAT_GRID,
  beforeAfter: BEFORE_AFTER,
  statusBadge: STATUS_BADGE,
}

/** Pattern key (kebab-case) → label + map of cardId → component. */
export const PATTERN_BY_KEY: Record<string, { label: string; map: Record<string, ComponentType> }> = {
  'hero-counter': { label: 'Hero counter', map: HERO_COUNTER },
  sparkline: { label: 'Sparkline', map: SPARKLINE },
  'stacked-totals': { label: 'Stacked totals', map: STACKED_TOTALS },
  checklist: { label: 'Checklist', map: CHECKLIST },
  comparison: { label: 'Comparison ladder', map: COMPARISON },
  'step-progress': { label: 'Step progress', map: STEP_PROGRESS },
  ticker: { label: 'Live ticker', map: TICKER },
  'heat-grid': { label: 'Heat grid', map: HEAT_GRID },
  gauge: { label: 'Gauge dial', map: GAUGE },
  'stat-grid': { label: 'Stat grid', map: STAT_GRID },
  'before-after': { label: 'Before / after', map: BEFORE_AFTER },
  'status-badge': { label: 'Status badge', map: STATUS_BADGE },
}

export const ICON_FLICKER = HERO_COUNTER
