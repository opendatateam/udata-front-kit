import { defineStore } from "pinia"

export const createDatasetStore = (client) => {
  return defineStore ('bouquet-datause-dataset', {
    state: () => ({
      name: '',
      uri: ''
    }),
    actions: {
      async get(id) {
        const response = client.get(id)
        this.name = response.title
        this.uri = response.page
        return this
      }
    }
  })
}