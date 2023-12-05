import { defineStore } from 'pinia'

export interface RootState {
  data: string
}

export const pageStore = defineStore('getPage', {
  state: () =>
    ({
      data: ''
    } satisfies RootState),
  getters: {
    content: (state) => {
      return state.data
    }
  },
  actions: {
    async getPageFromFile(path: string) {
      const res = await import(/* @vite-ignore */ path)
      this.data = res.default
    },
    async getPageFromLocation(url: string) {
      const response = await fetch(url)
      const res = await response.text()
      this.data = res
    }
  }
})
