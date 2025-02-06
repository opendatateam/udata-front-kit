import config from '@/config'
import type { ResolvedTag, TagSelectOption } from '@/model/tag'
import type { ComputedRef, Ref } from 'vue'

type ObjectTypes = 'topics' | 'indicators'

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
  child?: string
  values: {
    id: string
    name: string
    parent?: string
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
  objectType: ObjectTypes,
  object: Ref<T | undefined | null>,
  filterId: string
): ComputedRef<ResolvedTag | undefined> => {
  return computed(() => {
    const tags = useTags(objectType, object.value, filterId)
    return tags.value[0]
  })
}

export const getTagOptions = (
  objectType: ObjectTypes,
  filterId: string,
  parentTag?: string
): TagSelectOption[] => {
  const filter = getFilterConf(objectType, filterId)
  if (!filter) return []
  return filter.values.filter((value) => {
    if (!parentTag) return true
    return value.parent === parentTag
  })
}

export const getFilterConf = (
  objectType: ObjectTypes,
  filterId: string
): FilterConf | undefined => {
  // TODO: get properly typed from config wrapper
  const filters: FilterConf[] = config[objectType].filters
  return filters.find((filter) => filter.id === filterId)
}

export const useTagOptions = (
  objectType: ObjectTypes,
  tagName: Ref<string | undefined>,
  tagType: string
): {
  tagOptions: TagSelectOption[]
  subTagOptions: ComputedRef<TagSelectOption[]>
} => {
  const tagOptions = getTagOptions(objectType, tagType)

  const subTagOptions = computed(() => {
    if (!tagName) return []
    const filter = getFilterConf(objectType, tagType)
    if (!filter || !filter.child) return []
    return getTagOptions(objectType, filter.child, tagName.value)
  })

  return {
    tagOptions,
    subTagOptions
  }
}

export interface QueryArgs {
  [key: string]: string | null
}

/**
 * Build an array of normalized tags from query components and clean the original QueryArgs
 */
export const useTagsQuery = (
  objectType: ObjectTypes,
  query: QueryArgs
): { tag: Array<string>; extraArgs: QueryArgs } => {
  // TODO: get properly typed from config wrapper
  const filters: FilterConf[] = config[objectType].filters
  const tagPrefix: string = config[objectType].global_tag_prefix
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
