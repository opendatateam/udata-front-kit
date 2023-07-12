import { defineStore } from "pinia"

import SearchAPI from "../services/api/SearchAPI"

const searchAPI = new SearchAPI()
const pageSize = 21

export const useSearchStore = defineStore("search", {
  state: () => ({
    data: {}
  }),
  getters: {
    datasets: (state) => {
      return state.data.hits || []
    },
    pagination: (state) => {
      if (!state.data) return []
      return [...Array(state.data.totalPages).keys()].map(page => {
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
      const args = { hitsPerPage: pageSize, facets: ["organization.name"], page: page }
      const results = await searchAPI.search(query, args)
      this.data = results
    }
  },
})
