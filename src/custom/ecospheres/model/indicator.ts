import type { DatasetV2 } from '@datagouv/components'

export type Indicator = DatasetV2

export interface IndicatorFilters {
  theme: string | null
}

export interface IndicatorTag {
  color: string
  value: string
  type: string
}
