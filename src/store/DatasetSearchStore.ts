import { defineStore } from 'pinia'

import config from '@/config'
import SearchAPI from '@/services/api/SearchAPI'
import { useFiltersConf } from '@/utils/config'
import { useTagsQuery } from '@/utils/tags'
import type { DatasetV2 } from '@datagouv/components'

const PAGE_SIZE = 20
// max search window for elasticsearch on data.gouv.fr
const ES_MAX_TOTAL = 10000
const searchAPI = new SearchAPI()
const filtersConf = useFiltersConf('datasets')

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
    async query(args: QueryArgs) {
      const { query, ...queryArgs } = args
      const { extraArgs, tag } = useTagsQuery('datasets', queryArgs)
      const results = await searchAPI.search(
        query,
        config.universe.topic_id,
        1,
        {
          page_size: PAGE_SIZE,
          tag: [filtersConf.universe_tag, ...tag].filter(Boolean),
          ...extraArgs
        }
      )
      this.datasets = results.data
      this.total = results.total
    }
  }
})
