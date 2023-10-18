import { last } from 'lodash/fp/array'
import { defineStore } from 'pinia'

class NotImplementedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotImplementedError'
  }
}

const serializeDatause = (params) => {
  return {
    extras: {
      datauses: [
        {
          name: params?.name || null,
          description: params?.description || null
        }
      ]
    }
  }
}

const deserializeDatause = (params) => {
  const datauses = params?.extras?.datauses || []

  if (datauses.length > 1) {
    throw new NotImplementedError(
      'The function "createBouquet-datause.deserializeDatause" is not ' +
        'implemented for bouquets that have multiple datauses. Please ' +
        'use "createBouquet-datauses" to deserialize multiple datauses.'
    )
  }

  return {
    name: last(datauses)?.name || null,
    description: last(datauses)?.description || null
  }
}

const useBouquetDatauseStore = defineStore('createBouquet-datause', {
  state: () => ({
    name: null,
    description: null
  }),

  actions: {
    serialize(params = {}) {
      return serializeDatause({
        ...this.$state,
        ...params
      })
    },

    deserialize(params = {}) {
      this.$state = deserializeDatause({
        extras: {
          ...serializeDatause(this.$state).extras,
          ...(params?.extras || {})
        }
      })

      return this
    }
  }
})

export {
  NotImplementedError,
  serializeDatause,
  deserializeDatause,
  useBouquetDatauseStore
}
