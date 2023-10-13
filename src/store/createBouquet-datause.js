import { defineStore } from "pinia"

export const useBouquetDatauseStore = defineStore("createBouquet-datause", {
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
    }
  }
})
