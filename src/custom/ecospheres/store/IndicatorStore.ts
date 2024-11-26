import { defineStore } from 'pinia'

import config from '@/config'
import SearchAPI from '@/services/api/SearchAPI'
import type { Indicator } from '../model/indicator'
import { getTagsQuery } from '../utils/indicator'

const searchApi = new SearchAPI()

export interface RootState {
  indicators: Indicator[]
}

export const useIndicatorStore = defineStore('indicator', {
  state: (): RootState => ({
    indicators: []
  }),
  actions: {
    // FIXME: handle pagination
    async query(args: { query: string; theme: string | null }) {
      const { query, theme, ...queryArgs } = args
      const tag = getTagsQuery({ theme: theme })
      const results = await searchApi.search(query, null, 1, {
        organization: config.indicators.organization_id,
        tag,
        ...queryArgs
      })
      this.indicators = results.data
    }
  }
})
