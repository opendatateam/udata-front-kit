import config from '@/config'
import type { FilterConf, IndicatorsConf } from '../model/config'
import type { IndicatorFilters } from '../model/indicator'

export const useFilterConf = (filter: keyof IndicatorFilters): FilterConf => {
  const indicatorsConf = config.indicators as IndicatorsConf
  const filterConf = indicatorsConf.filters.find((f) => f.id === filter)
  if (!filterConf) {
    throw new Error(`Filter ${filter} not found`)
  }
  return filterConf
}
