import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { usePageQueryParams } from '@/utils/filters'

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

      const params = usePageQueryParams(pageKey || defaultPageKey, queryArgs)

      const results = await searchAPI.search(query, {
        ...params,
        page_size: PAGE_SIZE
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
