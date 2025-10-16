import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useCheckboxQuery } from '@/utils/filters'
import { useTagsQuery } from '@/utils/tags'
import { useUniverseQuery } from '@/utils/universe'

const PAGE_SIZE = 20

interface SearchAPI<T> {
  search: (
    query: string,
    params: Record<string, unknown>
  ) => Promise<{ data: T[]; total: number }>
}

interface SearchStoreConfig<T> {
  storeName: string
  defaultPageKey: string
  searchAPI: SearchAPI<T>
  maxTotal?: number | null
}

export function createSearchStore<T>({
  storeName,
  defaultPageKey,
  searchAPI,
  maxTotal = null
}: SearchStoreConfig<T>) {
  return defineStore(storeName, () => {
    // State
    const items = ref<T[]>([])
    const total = ref(0)

    // Getters
    const pagination = computed(() => {
      if (!items.value || !items.value.length) return []
      if (!total.value) return []
      return [...Array(Math.ceil(total.value / PAGE_SIZE)).keys()].map(
        (page) => {
          page += 1
          return {
            label: page.toString(),
            href: '#',
            title: `Page ${page}`
          }
        }
      )
    })
    const maxTotalValue = computed(() => maxTotal)

    // Actions
    async function query(
      args: { query: string; page: string },
      pageKey?: string
    ) {
      const { query, ...queryArgs } = args

      // extract tags and checkbox filters from query args
      const { extraArgs: argsAfterTagQuery, tags } = useTagsQuery(
        pageKey || defaultPageKey,
        queryArgs
      )
      const { extraArgs: refinedFilterArgs, checkboxArgs } = useCheckboxQuery(
        pageKey || defaultPageKey,
        argsAfterTagQuery
      )
      const { tagsWithUniverse, universeQuery } = useUniverseQuery(
        pageKey || defaultPageKey,
        tags
      )

      const results = await searchAPI.search(query, {
        page_size: PAGE_SIZE,
        tag: tagsWithUniverse,
        ...universeQuery,
        ...checkboxArgs,
        ...refinedFilterArgs
      })
      items.value = results.data
      total.value = results.total
    }

    return {
      items,
      total,
      pagination,
      maxTotal: maxTotalValue,
      query
    }
  })
}
