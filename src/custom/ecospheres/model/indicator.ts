import type { DatasetV2 } from '@datagouv/components'

export type Indicator = DatasetV2

// repeating keys is necessary, type becomes too complex to be usable if we don't
// we're keeping values and type in the same place to facilitate maintenance
export const FILTER_KEYS = [
  'theme',
  'enjeu',
  'secteur',
  'levier',
  'producteur'
] as const

export type IndicatorFilters = {
  theme: string | null
  enjeu: string | null
  secteur: string | null
  levier: string | null
  producteur: string | null
}

export interface IndicatorTag {
  color: string
  value: string
  type: string
}
