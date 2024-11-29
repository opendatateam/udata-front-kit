import config from '@/config'
import type { ComputedRef } from 'vue'
import type { IndicatorsConf } from '../model/config'
import type {
  Indicator,
  IndicatorFilters,
  IndicatorTag
} from '../model/indicator'

const indicatorsConf = config.indicators as IndicatorsConf
const tagPrefix = indicatorsConf.global_tag_prefix
const filters = indicatorsConf.filters

interface QueryArgs extends IndicatorFilters {
  [key: string]: string | null
}

/**
 * Build an array of normalized tags from query components and clean the original QueryArgs
 */
export const useTagsQuery = (
  query: QueryArgs
): { tag: Array<string>; extraArgs: QueryArgs } => {
  const queryArray = []
  for (const filter of filters) {
    if (query[filter.id] != null) {
      queryArray.push(`${tagPrefix}-${filter.id}-${query[filter.id]}`)
    }
    delete query[filter.id]
  }
  return {
    tag: queryArray,
    extraArgs: query
  }
}

/**
 * Extract and denormalize tags from an indicator
 */
export const useTags = (indicator: Indicator): ComputedRef<IndicatorTag[]> => {
  return computed(() => {
    return (
      indicator.tags
        ?.map((tag) => {
          if (tag.startsWith(tagPrefix)) {
            for (const filter of filters) {
              const filterPrefix = `${tagPrefix}-${filter.id}-`
              if (tag.startsWith(filterPrefix)) {
                const value = tag.replace(filterPrefix, '')
                const filterValue = filter.values.find((v) => v.id === value)
                if (filterValue) {
                  return {
                    color: filter.color,
                    value: filterValue.name,
                    type: filter.id
                  }
                }
              }
            }
          }
        })
        .filter((v) => !!v) || []
    )
  })
}
