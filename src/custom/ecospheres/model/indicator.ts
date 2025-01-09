import type { DatasetV2 } from '@datagouv/components'

export interface IndicatorExtrasCalcul {
  responsable: string
  methode: string
}

export type IndicatorExtras = DatasetV2['extras'] & {
  unite: string
  mailles_geographiques: string[]
  axes: {
    [key: string]: string[]
  }
  calcul: IndicatorExtrasCalcul
}

export type Indicator = DatasetV2 & {
  extras: IndicatorExtras
}

// repeating keys is necessary, type becomes too complex to be usable if we don't
// we're keeping values and type in the same place to facilitate maintenance
export const FILTER_KEYS = [
  'theme',
  'enjeu',
  'secteur',
  'levier',
  'producteur',
  'usage'
] as const

export type IndicatorFilters = {
  theme: string | null
  enjeu: string | null
  secteur: string | null
  levier: string | null
  producteur: string | null
  usage: string | null
}

export interface IndicatorTag {
  color: string
  value: string
  type: string
}
