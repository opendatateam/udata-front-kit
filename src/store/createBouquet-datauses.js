import { defineStore } from "pinia"

export const useBouquetDatauseStore = defineStore("createBouquet-datauses", {
  state: () => ({
    name: null,
    description: null
  }),
  actions: {
    create(response) {
      const datauses = response.data.extras.datauses
      const datause = datauses[datauses.length - 1]

      this.name = datause.name
      this.description = datause.description

      return this
    },
    serialize(payload) {
      const serializedPayload = {
        extras: {
          datauses: [
            {
              name: this.name,
              description: this.description
            }
          ]
        }
      }

      return {...serializedPayload, ...payload}
    },
    deserialize(payload) {
      let datauses = payload.extras.datauses
      if(!datauses) return []
    
      datauses.map((item) => datauses.push(item))
      return datauses
    }
  }
})
