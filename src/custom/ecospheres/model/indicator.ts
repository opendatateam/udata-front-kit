import type { DatasetV2 } from '@datagouv/components'

export interface IndicatorExtrasCalcul {
  responsable: string
  methode: string
}

export interface IndicatorExtrasSource {
  nom: string
  url: string
  description: string
  producteur: string
  distributeur: string
  plage_temporelle: {
    start: string
    end: string
  }
}

export interface IndicatorsExtrasApi {
  id: string
  description: string
  noms_cubes: string[]
}

export type IndicatorExtras = DatasetV2['extras'] & {
  unite: string
  mailles_geographiques: string[]
  axes: {
    [key: string]: string[]
  }
  calcul: IndicatorExtrasCalcul
  api: IndicatorsExtrasApi
  sources: IndicatorExtrasSource[]
}

export type Indicator = DatasetV2 & {
  extras: IndicatorExtras
}

export type IndicatorResourceExtras = {
  maille: string
  'value-column': string
  axes: {
    [key: string]: string[]
  }
}
