import { defineStore } from 'pinia'

import {
  serializeDatauses,
  useBouquetDatausesStore
} from '@/store/createBouquet-datauses'
import {
  serializeInformation,
  useBouquetInformationStore
} from '@/store/createBouquet-information'

export const createBouquetStore = (client) => {
  return defineStore('createBouquet', {
    state: () => ({
      bouquet: {
        id: null,
        name: null,
        description: null,
        tags: [],
        information: null,
        datauses: []
      },
      error: false
    }),

    actions: {
      async create(params) {
        const { status, data } = await client.create(this.serialize(params))

        if (status === 201) {
          this.deserialize(data)
        } else {
          this.error = 'error'
        }

        return this
      },

      async addInformation(params) {
        const { status, data } = await client.update(
          this.bouquet.id,
          this.serialize({ information: params })
        )

        if (status === 200) {
          this.deserialize(data)
        } else if (status === 400) {
          this.error = 'error'
        } else {
          this.error = 'not found'
        }

        return this
      },

      async addDatause(params) {
        const { status, data } = await client.update(
          this.bouquet.id,
          this.serialize({ datauses: params })
        )

        if (status === 200) {
          this.deserialize(data)
        } else if (status === 400) {
          this.error = 'error'
        } else {
          this.error = 'not found'
        }

        return this
      },

      serialize({ name, description, tags, information, datauses }) {
        let params = {
          name: name || this.bouquet.name,
          description: description || this.bouquet.description,
          tags: tags || this.bouquet.tags
        }

        if (information) {
          params = { ...params, ...serializeInformation(information) }
        }

        if (datauses) {
          params = { ...params, ...serializeDatauses(datauses) }
        }

        return params
      },

      deserialize({ id, name, description, tags, extras }) {
        const information = useBouquetInformationStore()
        const datauses = useBouquetDatausesStore()
        this.$state.bouquet = { id, name, description, tags }
        this.$state.bouquet.information = information.deserialize({ extras })
        this.$state.bouquet.datauses = datauses.deserialize({ extras })
        return this
      }
    }
  })
}
