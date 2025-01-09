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
export const useTags = (
  indicator?: Indicator,
  type?: string,
  exclude?: string[]
): ComputedRef<IndicatorTag[]> => {
  return computed(() => {
    const tags: IndicatorTag[] = []

    for (const tag of indicator?.tags || []) {
      if (!tag.startsWith(tagPrefix)) continue

      for (const filter of filters) {
        if (type && type !== filter.id) continue
        if (exclude?.includes(filter.id)) continue

        const filterPrefix = `${tagPrefix}-${filter.id}-`
        if (!tag.startsWith(filterPrefix)) continue

        const value = tag.replace(filterPrefix, '')
        const matchingValue = filter.values.find((v) => v.id === value)

        if (matchingValue) {
          tags.push({
            color: filter.color,
            value: matchingValue.name,
            type: filter.id
          })
        }
      }
    }

    return tags
  })
}

export const useIndicatorExtras = (indicator: Ref<Indicator | undefined>) => {
  const unite: Ref<string | undefined> = ref()

  watch(
    indicator,
    () => {
      const extras = indicator.value?.extras?.['ecospheres-indicateurs']
      if (extras) {
        unite.value = extras.unite
      }
    },
    { immediate: true }
  )

  return {
    unite
  }
}
