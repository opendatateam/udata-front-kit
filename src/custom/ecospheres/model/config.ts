import { type IndicatorFilters } from './indicator'

export interface IndicatorsConf {
  global_tag_prefix: string
  organization_id: string
  filters: {
    id: keyof IndicatorFilters
    name: string
  }[]
}
