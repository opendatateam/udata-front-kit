import { defineStore } from 'pinia'

import {
  serializeDatauses,
  useBouquetDatausesStore
} from '@/store/createBouquet-datauses'
import { useBouquetInformationStore } from '@/store/createBouquet-information'

class UnknownError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnknownError'
  }
}

export const createBouquetStore = (client) => {
  return defineStore('createBouquet', {
    state: () => ({
      id: null,
      name: null,
      description: null,
      tags: [],
      information: useBouquetInformationStore(),
      datauses: [],
      error: false
    }),

    actions: {
      async create(params) {
        const response = await client.create(this.serialize(params))
        const { status, data, error } = response

        if (status === 201) {
          this.deserialize(data)
        } else if (status === 400) {
          this.error = error
        } else {
          throw new UnknownError(JSON.stringify(response))
        }

        return this
      },

      async addInformation(params) {
        const response = client.update(
          this.id,
          this.serialize({ information: params })
        )

        const { status, data, error } = response

        if (status === 200) {
          this.deserialize(data)
        } else if (status === 400 || status === 404) {
          this.error = error
        } else {
          throw new UnknownError(JSON.stringify(response))
        }

        return this
      },

      async addDatause(params) {
        const response = await client.update(
          this.id,
          this.serialize({ datauses: params })
        )

        const { status, data, error } = response

        if (status === 200) {
          this.deserialize(data)
        } else if (status === 400 || status === 404) {
          this.error = error
        } else {
          throw new UnknownError(JSON.stringify(response))
        }

        return this
      },

      serialize({ name, description, tags, information, datauses }) {
        return {
          name: name || this.name,
          description: description || this.description,
          tags: tags || this.tags,
          ...this.information.serialize(information),
          ...serializeDatauses(datauses)
        }
      },

      deserialize({ id, name, description, tags, extras }) {
        this.$state = {
          id,
          name,
          description,
          tags,
          information: this.information.deserialize({ extras }),
          datauses: useBouquetDatausesStore().deserialize({ extras })
        }

        return this
      }
    }
  })
}
