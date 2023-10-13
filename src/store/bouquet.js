import { defineStore } from "pinia"

export const createBouquetStore = (client) => {
  return defineStore ('bouquet', {
    state: () => ({
      data: {
        name: null,
        description: null
      },
      error: null
    }),
    actions: {
      async create(bouquet) {
        const response = await client.create(bouquet)

        if(response.status === 201) {
          this.data.name = response.data.name
          this.data.description = response.data.description
        } else {
          this.error = "error"
        }
        
        return this
      }
    }
  })
}