import { defineStore } from 'pinia'

import SearchAPI from '@/services/api/SearchAPI'
import { useCheckboxQuery } from '@/utils/filters'
import { useTagsQuery } from '@/utils/tags'
import { useUniverseQuery } from '@/utils/universe'
import type { DatasetV2 } from '@datagouv/components-next'

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
    async query(args: QueryArgs, pageKey?: string) {
      const { query, ...queryArgs } = args

      // extract tags and checkbox filters from query args
      const { extraArgs: argsAfterTagQuery, tags } = useTagsQuery(
        pageKey || 'datasets',
        queryArgs
      )
      const { extraArgs: refinedFilterArgs, checkboxArgs } = useCheckboxQuery(
        pageKey || 'datasets',
        argsAfterTagQuery
      )
      const { tagsWithUniverse, universeQuery } = useUniverseQuery(
        pageKey || 'datasets',
        tags
      )

      const results = await searchAPI.search(query, {
        page_size: PAGE_SIZE,
        tag: tagsWithUniverse,
        ...universeQuery,
        ...checkboxArgs,
        ...refinedFilterArgs
      })
      this.datasets = results.data
      this.total = results.total
    }
  }
})
