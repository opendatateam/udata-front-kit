import config from '@/config'
import type { IndicatorsConf } from '../model/config'
import type { IndicatorFilters } from '../model/indicator'

interface IndicatorFiltersQuery extends IndicatorFilters {
  [key: string]: string | null
}

/**
 * Build an array of normalized tags from query components
 */
export const getTagsQuery = (query: IndicatorFiltersQuery): Array<string> => {
  const indicatorsConf = config.indicators as IndicatorsConf
  const tagPrefix = indicatorsConf.global_tag_prefix
  const filters = indicatorsConf.filters
  const queryArray = []
  for (const filter of filters) {
    if (query[filter.id] != null) {
      queryArray.push(`${tagPrefix}-${filter.id}-${query[filter.id]}`)
    }
  }
  return queryArray
}
