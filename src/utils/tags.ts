import type { PageFilterConf } from '@/model/config'
import type { ResolvedTag } from '@/model/tag'
import type { ComputedRef, Ref } from 'vue'
import { usePageConf } from './config'
import { getFilterConf, parseFilterValue } from './filters'

interface HasTags {
  tags: string[] | null
}

export const useTagsForFilter = <T extends HasTags>(
  filter: PageFilterConf,
  filterPrefixFromPage: string | null,
  object: T | undefined | null
): ResolvedTag[] => {
  const tags: ResolvedTag[] = []
  for (const tag of object?.tags || []) {
    const matchingValue = parseFilterValue(filter, filterPrefixFromPage, tag)
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
  const filterPrefix = pageConf.filter_prefix
  const filters = pageConf.filters
  return computed(() => {
    const tags: ResolvedTag[] = []
    for (const filter of filters.filter((f) => f.type === 'select')) {
      if (filterId && filterId !== filter.id) continue
      if (exclude?.includes(filter.id)) continue
      tags.push(...useTagsForFilter(filter, filterPrefix, object))
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

export interface QueryArgs {
  [key: string]: string | null | undefined
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
