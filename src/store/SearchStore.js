import { defineStore } from 'pinia'

import config from '@/config'

import SearchAPI from '../services/api/SearchAPI'

const searchAPI = new SearchAPI()
const pageSize = 21

export const useSearchStore = defineStore('search', {
  state: () => ({
    data: {}
  }),
  getters: {
    facets: (state) => {
      return state.data.facetDistribution || {}
    },
    datasets: (state) => {
      return state.data.data || []
    },
    pagination: (state) => {
      if (!state.data) return []
      if (!state.data.total && !state.data.page_size) return []
      return [
        ...Array(Math.round(state.data.total / state.data.page_size)).keys()
      ].map((page) => {
        page += 1
        return {
          label: page,
          href: '#',
          title: `Page ${page}`
        }
      })
    }
  },
  actions: {
    async search(query, topic, page = 1) {
      const args = { page_size: pageSize, page }
      const results = await searchAPI.search(
        query,
        topic || config.universe.topic_id,
        page,
        args
      )
      this.data = results
    }
  }
})
