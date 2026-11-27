export const FONT = 'Marianne, arial, sans-serif'

export const BLUE = '#000091'
export const PURPLE = '#6A6AF4'
export const RED = '#E1000F'
export const TEAL = '#009081'
export const ORANGE = '#E4794A'
const GOLD = '#B7A73F'
const PLUM = '#A558A0'
const SKY = '#0063CB'

export const PALETTE = [
  BLUE,
  PURPLE,
  RED,
  GOLD,
  TEAL,
  ORANGE,
  PLUM,
  SKY,
  '#417DC4'
]

export const integerFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0
})

export const decimalFormat = new Intl.NumberFormat('fr-FR', {
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
  kind?: 'bar' | 'line'
}

export type PieSlice = {
  label: string
  value: number
}
