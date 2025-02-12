import { type IndicatorFilters } from './indicator'

export interface FilterConf {
  id: keyof IndicatorFilters
  name: string
  color: string
  values: {
    id: string
    name: string
  }[]
}

export interface IndicatorsConf {
  tag_prefix: string
  organization_id: string
  filters: FilterConf[]
}
