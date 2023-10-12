import { defineStore, StoreDefinition } from "pinia"

/**
 * A bounded-context store for datasets.
 *
 * @param client {DatasetsAPI} - A client to fetch data from.
 * @returns {StoreDefinition}
 */
export const createDatasetStore = (client) => {
  return defineStore("bouquet-datause-dataset", {
    state: () => ({
      id: '',
      page: '',
      title: '',
    }),
    getters: {
      uri: (state) => state.page,
      name: (state) => state.title,
    },
    actions: {
      /**
       * Get a dataset from somewhere.
       *
       * @param id {string} - The dataset id.
       * @returns {Promise<StoreDefinition>}
       */
      async get(id) {
        if (this.id === id) return this
        const { page, title } = await client.get(id)
        this.id = id
        this.page = page
        this.title = title
        return this
      },
    },
  })()
}
