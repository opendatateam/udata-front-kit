import { defineStore, storeToRefs } from 'pinia'

import SearchAPI from '@/services/api/SearchAPI'
import { useUserStore } from '@/store/UserStore'

const { client } = storeToRefs(useUserStore())
const searchAPI = new SearchAPI({ client })
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
      const results = await searchAPI.search(query, topic, page, args)
      this.data = results
    }
  }
})
