import { defineStore } from 'pinia'

import DataserviceSearchAPI from '@/services/api/DataserviceSearchAPI'
import { useCheckboxQuery } from '@/utils/filters'
import { useTagsQuery } from '@/utils/tags'
import { useUniverseQuery } from '@/utils/universe'
import type { Dataservice } from '@datagouv/components'

const PAGE_SIZE = 20
// max search window for elasticsearch on data.gouv.fr
const ES_MAX_TOTAL = 10000
const searchAPI = new DataserviceSearchAPI()

interface QueryArgs {
  query: string
  page: string
}

interface RootState {
  dataservices: Dataservice[]
  total: number
}

export const useDataserviceSearchStore = defineStore('search', {
  state: (): RootState => ({
    dataservices: [],
    total: 0
  }),
  getters: {
    pagination: (state) => {
      if (!state.dataservices) return []
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
        pageKey || 'dataservices',
        queryArgs
      )
      const { extraArgs: refinedFilterArgs, checkboxArgs } = useCheckboxQuery(
        pageKey || 'dataservices',
        argsAfterTagQuery
      )
      const { tagsWithUniverse, universeQuery } = useUniverseQuery(
        pageKey || 'dataservices',
        tags
      )

      const results = await searchAPI.search(query, {
        page_size: PAGE_SIZE,
        tag: tagsWithUniverse,
        ...universeQuery,
        ...checkboxArgs,
        ...refinedFilterArgs
      })
      this.dataservices = results.data
      this.total = results.total
    }
  }
})
