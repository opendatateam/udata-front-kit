import { defineStore } from "pinia"

import SearchAPI from "../services/api/SearchAPI"

const searchAPI = new SearchAPI()
const pageSize = 21

export const useSearchStore = defineStore("search", {
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
      if (!state.data.total) return []
      const totalPages = Math.ceil(state.data.total / pageSize)
      return [...Array(totalPages).keys()].map(page => {
        page += 1
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        }
      })
    },
  },
  actions: {
    async search (query, page = 1) {
      const args = { page_size: pageSize, page }
      const results = await searchAPI.search(query, args)
      this.data = results
    }
  },
})
