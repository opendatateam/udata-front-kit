import config from '@/config'
import type { ResolvedTag } from '@/model/tag'

interface HasTags {
  tags: string[] | null
}

// FIXME: mutualize with indicators
// should we drop IndicatorFilters niceties for more flexibility?
export interface FilterConf {
  // id: keyof IndicatorFilters
  id: string
  name: string
  color: string
  values: {
    id: string
    name: string
  }[]
}

/**
 * Extract and denormalize tags from an object
 */
export const useTags = <T extends HasTags>(
  objectType: 'topics' | 'indicators',
  object: T | undefined | null,
  filterId?: string,
  exclude?: string[]
): ComputedRef<ResolvedTag[]> => {
  // TODO: get properly typed from config wrapper
  const tagPrefix: string = config[objectType].global_tag_prefix
  const filters: FilterConf[] = config[objectType].filters

  return computed(() => {
    const tags: ResolvedTag[] = []

    for (const tag of object?.tags || []) {
      if (!tag.startsWith(tagPrefix)) continue

      for (const filter of filters) {
        if (filterId && filterId !== filter.id) continue
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

export const useTag = <T extends HasTags>(
  objectType: 'topics' | 'indicators',
  object: Ref<T | undefined | null>,
  filterId: string
): ComputedRef<ResolvedTag | undefined> => {
  return computed(() => {
    const tags = useTags(objectType, object.value, filterId)
    return tags.value[0]
  })
}
