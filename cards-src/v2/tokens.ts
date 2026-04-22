/**
 * Slim tokens for the marketing site bundle — the palette, font stack, icon
 * map, per-card pick, and per-card eyebrow string. Edit `CARD_PICK` to swap
 * a card's animation, or `CARD_EYEBROW` to change a card's eyebrow text.
 */

export const PALETTE = {
  ink: '#0f172a',
  inkSoft: '#475569',
  muted: '#94a3b8',
  paper: '#fafaf7',
  paperWarm: '#faf5eb',
  paperCool: '#eef4f8',
  paperPink: '#fdf2f6',
  paperMint: '#effaf3',
  paperCream: '#fdf6e7',

  emerald: '#10b981',
  emeraldDeep: '#047857',
  emeraldPale: '#d1fae5',

  rose: '#f43f5e',
  roseDeep: '#9f1239',
  rosePale: '#fecdd3',

  amber: '#f59e0b',
  amberDeep: '#b45309',
  amberPale: '#fde68a',

  violet: '#8b5cf6',
  violetDeep: '#6d28d9',
  violetPale: '#ddd6fe',

  sky: '#0ea5e9',
  skyDeep: '#0369a1',
  skyPale: '#bae6fd',

  forest: '#064e3b',
  cream: '#fef3c7',
  blush: '#fda4af',
  clay: '#f4a261',
  shadow: 'rgba(15, 23, 42, 0.12)',
}

export const FONTS = {
  serif: '"Iowan Old Style", "Charter", Georgia, "Times New Roman", serif',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
}

/** Glass-friendly palette used by the shared icon-flicker primitives. */
export const GLASS_PALETTE = {
  rose: '#ff3b6b',
  rosePeach: '#ff8a4f',
  amber: '#ffaa00',
  citrus: '#ffd429',
  emerald: '#00c281',
  teal: '#1cc8c8',
  sky: '#1aa8ff',
  indigo: '#5b5bff',
  violet: '#8b5cff',
  magenta: '#d63bff',

  roseDeep: '#a30033',
  amberDeep: '#a64b00',
  emeraldDeep: '#005c3d',
  skyDeep: '#005299',
  violetDeep: '#3a1d99',

  ink: '#0b0e14',
  inkSoft: '#373d4d',
  graphite: '#5b6275',
  silver: '#a4abbe',
  white: '#ffffff',
  cream: '#f8f4ec',
}

/** Card → icon mapping shared across all 12 patterns. */
export type IconKey = 'wallet' | 'bulb' | 'wave' | 'shield' | 'mail' | 'spark' | 'building' | 'balance'

export const CARD_ICON: Record<string, IconKey> = {
  cost: 'wallet',
  waste: 'bulb',
  compliance: 'shield',
  savings: 'wallet',
  'bill-crush': 'wallet',
  'usage-boulder': 'wave',
  'incentive-scan': 'spark',
  'retrofit-bulb': 'bulb',
  'hoa-catch': 'building',
  'retrofit-balance': 'balance',
  'compliance-scan': 'shield',
  'benchmark-mail': 'mail',
}

/**
 * The picked content pattern for each card on the marketing site. One pattern
 * per card (the marketing site doesn't show A/B/C alternates).
 */
export const CARD_PICK: Record<string, string> = {
  'usage-boulder': 'heat-grid',
  waste: 'gauge',
  'hoa-catch': 'hero-counter',
  'benchmark-mail': 'status-badge',
  cost: 'before-after',
  compliance: 'step-progress',
  'bill-crush': 'comparison',
  savings: 'stacked-totals',
  'compliance-scan': 'checklist',
  'incentive-scan': 'ticker',
  'retrofit-bulb': 'stat-grid',
  'retrofit-balance': 'comparison',
}

/**
 * Eyebrow text shown above each card's animation. ONE place to edit — each
 * pattern's index.tsx reads from here. Keep these short (≤ ~16 chars) so
 * they sit on a single line and the icon stays anchored to the right.
 */
export const CARD_EYEBROW: Record<string, string> = {
  cost: 'Monthly bill',
  waste: 'Equipment EER',
  compliance: 'Compliance flow',
  savings: 'Annual savings',
  'bill-crush': 'Plan match',
  'usage-boulder': 'Load grid',
  'incentive-scan': 'Incentive scan',
  'retrofit-bulb': 'Retrofit kit',
  'hoa-catch': 'Recovered YTD',
  'retrofit-balance': 'Retrofit ROI',
  'compliance-scan': 'Reg sweep',
  'benchmark-mail': 'Submission',
}
