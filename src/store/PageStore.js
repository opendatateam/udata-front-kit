import { defineStore } from "pinia"

export const pageStore = defineStore("getPage", {
  state: () => ({
    data: "",
  }),
  getters: {
    content: (state) => {
      return state.data || ""
    },
  },
  actions: {
    async getPageFromUrl(url) {
      const response = await fetch(url)
      const res = await response.text()
      this.data = res
    }
  },
})
