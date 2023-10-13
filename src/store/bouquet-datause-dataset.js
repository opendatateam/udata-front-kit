import { defineStore } from "pinia"

export const createDatasetStore = (client) => {
  return defineStore ('bouquet-datause-dataset', {
    state: () => ({
      name: null,
      uri: null
    }),
    actions: {
      async get(id) {
        const response = await client.get(id)
        if(response.status === 200) {
          this.name = response.data.title
          this.uri = response.data.page

        }
        
        return this
      }
    }
  })
}