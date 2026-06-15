import type {
  DatasetV2WithFullObject,
  Resource
} from '@datagouv/components-next'

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
  plage_temporelle?: {
    start: string
    end: string
  }
}

export interface IndicatorExtrasData {
  unite: string
  mailles_geographiques: string[]
  axes: {
    [key: string]: string[]
  }
  calcul: IndicatorExtrasCalcul
  sources: IndicatorExtrasSource[]
  // visualisation attributes
  summable?: boolean
  y_start_at_zero?: boolean
  ignore_format_big_number?: boolean
  enable_visualization?: boolean
  next_expected_update_quarter?: string
}

export type IndicatorExtras = DatasetV2WithFullObject['extras'] & {
  'ecospheres-indicateurs': IndicatorExtrasData
}

export type Indicator = DatasetV2WithFullObject & {
  extras: IndicatorExtras
}

export type IndicatorMesh = 'fr' | 'region' | 'departement' | 'epci'

export type IndicatorResourceExtras = {
  maille: IndicatorMesh
  'value-column': string
  axes: {
    [key: string]: string[]
  }
}

export type IndicatorResource = Resource & {
  extras: Record<string, unknown> & {
    'ecospheres-indicateurs'?: IndicatorResourceExtras
  }
}
