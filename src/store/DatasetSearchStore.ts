import { defineStore } from 'pinia'

import SearchAPI from '@/services/api/SearchAPI'
import { useFiltersConf } from '@/utils/config'
import { useTagsQuery } from '@/utils/tags'
import type { DatasetV2 } from '@datagouv/components'

const PAGE_SIZE = 20
// max search window for elasticsearch on data.gouv.fr
const ES_MAX_TOTAL = 10000
const searchAPI = new SearchAPI()

interface QueryArgs {
  query: string
  page: string
}

interface RootState {
  datasets: DatasetV2[]
  total: number
}

export const useSearchStore = defineStore('search', {
  state: (): RootState => ({
    datasets: [],
    total: 0
  }),
  getters: {
    pagination: (state) => {
      if (!state.datasets) return []
      if (!state.total) return []
      return [...Array(Math.ceil(state.total / PAGE_SIZE)).keys()].map(
        (page) => {
          page += 1
          return {
            label: page.toString(),
            href: '#',
            title: `Page ${page}`
          }
        }
      )
    },
    maxTotal: () => ES_MAX_TOTAL
  },
  actions: {
    async query(args: QueryArgs, filterKey?: string) {
      const filtersConf = useFiltersConf(filterKey || 'datasets')
      const { query, ...queryArgs } = args
      const { extraArgs, tag } = useTagsQuery(
        filterKey || 'datasets',
        queryArgs
      )
      const { tag: universeTag, ...universeQuery } = filtersConf.universe_query
      const results = await searchAPI.search(query, {
        page_size: PAGE_SIZE,
        tag: [universeTag, ...tag].filter(Boolean),
        ...universeQuery,
        ...extraArgs
      })
      this.datasets = results.data
      this.total = results.total
    }
  }
})
