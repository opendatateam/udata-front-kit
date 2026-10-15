export const FONT = 'Marianne, arial, sans-serif'

export const BLUE = '#000091'
export const PURPLE = '#6A6AF4'
export const RED = '#E1000F'
export const TEAL = '#009081'
export const ORANGE = '#E4794A'
export const GOLD = '#B7A73F'
export const PLUM = '#A558A0'
export const SKY = '#0063CB'
export const BAR_PALE = '#C1C1FB'

export const PIE_COLORS = [BLUE, PURPLE, RED, GOLD, TEAL, ORANGE, PLUM, SKY]

export const integerFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0
})

export const decimalFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

export const monthFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

export const compactFormat = new Intl.NumberFormat('fr-FR', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1
})

export type ChartSeries = {
  label: string
  data: (number | null)[]
  color: string
  fill?: string
  kind?: 'bar' | 'line'
  markers?: boolean
  stack?: string
}

export type PieSlice = {
  label: string
  value: number
}
