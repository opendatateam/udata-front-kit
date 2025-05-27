import type { PageFilterConf, PageFilterValueConf } from '@/model/config'
import type { ResolvedTag, TagSelectOption } from '@/model/tag'
import type { ComputedRef, Ref } from 'vue'
import { usePageConf } from './config'

interface HasTags {
  tags: string[] | null
}

export const useFilterValue = (
  filterConf: PageFilterConf,
  tagPrefix: string | null,
  tag: string
): PageFilterValueConf | undefined => {
  const filterPrefix = filterConf.use_tag_prefix
    ? `${tagPrefix}-${filterConf.id}-`
    : null
  if (filterPrefix && !tag.startsWith(filterPrefix)) return
  const value =
    filterConf.use_tag_prefix && filterPrefix
      ? tag.replace(filterPrefix, '')
      : tag
  return filterConf.values.find((v) => v.id === value)
}

export const useTagsForFilter = <T extends HasTags>(
  filter: PageFilterConf,
  tagPrefix: string | null,
  object: T | undefined | null
): ResolvedTag[] => {
  const tags: ResolvedTag[] = []
  for (const tag of object?.tags || []) {
    const matchingValue = useFilterValue(filter, tagPrefix, tag)
    if (matchingValue) {
      tags.push({
        color: filter.color,
        name: matchingValue.name,
        type: filter.id,
        id: matchingValue.id
      })
    }
  }
  return tags
}

/**
 * Extract and denormalize tags from an object
 */
export const useTags = <T extends HasTags>(
  pageKey: string,
  object: T | undefined | null,
  filterId?: string,
  exclude?: string[]
): ComputedRef<ResolvedTag[]> => {
  const pageConf = usePageConf(pageKey)
  const tagPrefix = pageConf.tag_prefix
  const filters = pageConf.filters
  return computed(() => {
    const tags: ResolvedTag[] = []
    for (const filter of filters.filter((f) => f.type === 'select')) {
      if (filterId && filterId !== filter.id) continue
      if (exclude?.includes(filter.id)) continue
      tags.push(...useTagsForFilter(filter, tagPrefix, object))
    }
    return tags
  })
}

export const useTagsByRef = <T extends HasTags>(
  pageKey: string,
  object: Ref<T | undefined | null>,
  filterId?: string,
  exclude?: string[]
): ComputedRef<ResolvedTag[]> => {
  return computed(() => useTags(pageKey, object.value, filterId, exclude).value)
}

export const useTag = <T extends HasTags>(
  pageKey: string,
  object: Ref<T | undefined | null>,
  filterId: string
): ComputedRef<ResolvedTag | undefined> => {
  return computed(() => {
    const tags = useTags(pageKey, object.value, filterId)
    return tags.value[0]
  })
}

export const getTagOptions = (
  pageKey: string,
  filterId: string,
  parentTagId?: string
): TagSelectOption[] => {
  const filter = getFilterConf(pageKey, filterId)
  if (!filter) return []
  return filter.values.filter((value) => {
    if (!parentTagId) return true
    return value.parent === parentTagId
  })
}

export const getFilterConf = (
  pageKey: string,
  filterId: string
): PageFilterConf | undefined => {
  const pageConf = usePageConf(pageKey)
  return pageConf.filters.find((filter) => filter.id === filterId)
}

export const useTagOptions = (
  pageKey: string,
  tagId: Ref<string | undefined>,
  tagType: string
): {
  tagOptions: TagSelectOption[]
  subTagOptions: ComputedRef<TagSelectOption[]>
} => {
  const tagOptions = getTagOptions(pageKey, tagType)

  const subTagOptions = computed(() => {
    if (!tagId) return []
    const filter = getFilterConf(pageKey, tagType)
    if (!filter || !filter.child) return []
    return getTagOptions(pageKey, filter.child, tagId.value)
  })

  return {
    tagOptions,
    subTagOptions
  }
}

export interface QueryArgs {
  [key: string]: string | null | undefined
}

export const useTagSlug = (
  pageKey: string,
  filterId: string,
  tagId?: string | null,
  useTagPrefix = true
): string => {
  if (!useTagPrefix) return tagId || ''
  const pageConf = usePageConf(pageKey)
  return `${pageConf.tag_prefix}-${filterId}-${tagId || ''}`
}

/**
 * Build an array of normalized tags from query components and clean the original QueryArgs
 */
export const useTagsQuery = (
  pageKey: string,
  query: QueryArgs,
  filterOnForm: boolean = false
): { tags: Array<string>; extraArgs: QueryArgs } => {
  const pageConf = usePageConf(pageKey)
  const filters = pageConf.filters
    .filter((item) => item.type === 'select')
    .filter((item) => !filterOnForm || item.form != null)
  const queryArray = []
  for (const filter of filters) {
    const queryFilter = query[filter.id]
    if (queryFilter != null) {
      queryArray.push(
        useTagSlug(
          pageKey,
          filter.id,
          queryFilter,
          filter.use_tag_prefix || false
        )
      )
    }
    delete query[filter.id]
  }
  return {
    tags: queryArray,
    extraArgs: query
  }
}

export const useTagFromId = (
  pageKey: string,
  filterId: string,
  tagId: string | null
): ResolvedTag | null => {
  const filter = getFilterConf(pageKey, filterId)
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
