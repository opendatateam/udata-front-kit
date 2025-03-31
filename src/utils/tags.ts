import type { FilterItemConf } from '@/model/config'
import type { ResolvedTag, TagSelectOption } from '@/model/tag'
import type { ComputedRef, Ref } from 'vue'
import { useFiltersConf } from './config'

interface HasTags {
  tags: string[] | null
}

/**
 * Extract and denormalize tags from an object
 */
export const useTags = <T extends HasTags>(
  filterKey: string,
  object: T | undefined | null,
  filterId?: string,
  exclude?: string[]
): ComputedRef<ResolvedTag[]> => {
  const filtersConf = useFiltersConf(filterKey)
  const tagPrefix = filtersConf.tag_prefix
  const filters = filtersConf.items

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
            name: matchingValue.name,
            type: filter.id,
            id: matchingValue.id
          })
        }
      }
    }

    return tags
  })
}

export const useTag = <T extends HasTags>(
  filterKey: string,
  object: Ref<T | undefined | null>,
  filterId: string
): ComputedRef<ResolvedTag | undefined> => {
  return computed(() => {
    const tags = useTags(filterKey, object.value, filterId)
    return tags.value[0]
  })
}

export const getTagOptions = (
  filterKey: string,
  filterId: string,
  parentTagId?: string
): TagSelectOption[] => {
  const filter = getFilterConf(filterKey, filterId)
  if (!filter) return []
  return filter.values.filter((value) => {
    if (!parentTagId) return true
    return value.parent === parentTagId
  })
}

export const getFilterConf = (
  filterKey: string,
  filterId: string
): FilterItemConf | undefined => {
  const filtersConf = useFiltersConf(filterKey)
  return filtersConf.items.find((filter) => filter.id === filterId)
}

export const useTagOptions = (
  filterKey: string,
  tagId: Ref<string | undefined>,
  tagType: string
): {
  tagOptions: TagSelectOption[]
  subTagOptions: ComputedRef<TagSelectOption[]>
} => {
  const tagOptions = getTagOptions(filterKey, tagType)

  const subTagOptions = computed(() => {
    if (!tagId) return []
    const filter = getFilterConf(filterKey, tagType)
    if (!filter || !filter.child) return []
    return getTagOptions(filterKey, filter.child, tagId.value)
  })

  return {
    tagOptions,
    subTagOptions
  }
}

export interface QueryArgs {
  [key: string]: string | null
}

export const useTagSlug = (
  filterKey: string,
  filterId: string,
  tagId?: string,
  useTagPrefix = true
): string => {
  if (!useTagPrefix) return tagId || ''
  const filtersConf = useFiltersConf(filterKey)
  return `${filtersConf.tag_prefix}-${filterId}-${tagId || ''}`
}

/**
 * Build an array of normalized tags from query components and clean the original QueryArgs
 */
export const useTagsQuery = (
  filterKey: string,
  query: QueryArgs
): { tag: Array<string>; extraArgs: QueryArgs } => {
  const filtersConf = useFiltersConf(filterKey)
  const filters = filtersConf.items.filter((item) => item.type === 'select')
  const queryArray = []
  for (const filter of filters) {
    const queryFilter = query[filter.id]
    if (queryFilter != null) {
      queryArray.push(
        useTagSlug(filterKey, filter.id, queryFilter, filter.use_tag_prefix)
      )
    }
    delete query[filter.id]
  }
  return {
    tag: queryArray,
    extraArgs: query
  }
}

export const useTagFromId = (
  filterKey: string,
  filterId: string,
  tagId: string | null
): ResolvedTag | null => {
  const filter = getFilterConf(filterKey, filterId)
  if (!filter) return null
  const tag = filter.values.find((v) => v.id === tagId)
  if (!tag) return null
  return {
    color: filter.color,
    type: filter.id,
    name: tag.name,
    id: tag.id
  }
}
