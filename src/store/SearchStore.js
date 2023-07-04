import { defineStore } from "pinia"

import SearchAPI from "../services/api/SearchAPI"

const searchAPI = new SearchAPI()

export const useSearchStore = defineStore("search", {
  state: () => ({
    data: []
  }),
  actions: {
    async search (query) {
      const results = await searchAPI.search(query)
      this.data = results
    }
  },
})
