import config from '@/config'
import type { FilterConf, IndicatorsConf } from '../model/config'
import { type IndicatorFilters, FILTER_KEYS } from '../model/indicator'

export const useFiltersConf = () => {
  return FILTER_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: useFilterConf(key)
    }),
    {} as Record<keyof IndicatorFilters, FilterConf>
  )
}

export const useFilterConf = (filter: keyof IndicatorFilters): FilterConf => {
  const indicatorsConf = config.indicators as IndicatorsConf
  const filterConf = indicatorsConf.filters.find((f) => f.id === filter)
  if (!filterConf) {
    throw new Error(`Filter ${filter} not found`)
  }
  return filterConf
}
