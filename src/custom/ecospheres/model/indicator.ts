import type { DatasetV2 } from '@datagouv/components-next'

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

export interface IndicatorExtrasData {
  unite: string
  mailles_geographiques: string[]
  axes: {
    [key: string]: string[]
  }
  calcul: IndicatorExtrasCalcul
  api: IndicatorsExtrasApi
  sources: IndicatorExtrasSource[]
  // visualisation attributes
  summable?: boolean
  y_start_at_zero?: boolean
  ignore_format_big_number?: boolean
  enable_visualization?: boolean
}

export type IndicatorExtras = DatasetV2['extras'] & {
  'ecospheres-indicateurs': IndicatorExtrasData
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
