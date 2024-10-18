import { defineStore } from 'pinia'

export interface RootState {
  data: string
}

export const pageStore = defineStore('getPage', {
  state: () =>
    ({
      data: ''
    }) satisfies RootState,
  getters: {
    content: (state) => {
      return state.data
    }
  },
  actions: {
    async getPageFromUrl(url: string) {
      const response = await fetch(url)
      const res = await response.text()
      this.data = res
    }
  }
})
