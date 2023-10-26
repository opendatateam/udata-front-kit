import { defineStore, StoreDefinition } from 'pinia'

import Bouquet from '@/contexts/createBouquet/bouquet'

/**
 * Thrown under uncertain circumstances.
 */
class UnknownError extends Error {
  /**
   * @type {string}
   */
  name = this.constructor.name

  /**
   * @type {string}
   */
  message

  /**
   * Create a {UnknownError}.
   *
   * @param {string} message
   */
  constructor(message) {
    super(message)
    this.message = message
  }
}

/**
 * @callback useBouquetStore
 * @returns {StoreDefinition}
 */

/**
 * Create a high-order function that creates a bouquet store.
 *
 * @param client
 * @returns {useBouquetStore}
 */
export const createBouquetStore = (client) => {
  return defineStore('createBouquet', {
    state: () => ({
      bouquet: null,
      error: false
    }),

    actions: {
      /**
       * Create a bouquet.
       *
       * @param {Bouquet} bouquet
       * @returns {Promise<Bouquet>}
       */
      async create(bouquet) {
        const data = bouquet.serialize()
        const response = await client.create(data)
        return this.dispatch(response)
      },

      /**
       * Add a {Scope} to a {Bouquet}.
       *
       * @param {Scope} scope
       * @returns {Promise<Bouquet>}
       */
      async addScope(scope) {
        this.bouquet.scope = scope
        const { id, ...data } = this.bouquet.serialize()
        const response = client.update(id, data)
        return this.dispatch(response)
      },

      /**
       * Add a {Scope} to a {Bouquet}.
       *
       * @param {DatasetProperties} datasetProperties
       * @returns {Promise<Bouquet>}
       */
      async addDatasetProperties(datasetProperties) {
        this.bouquet.datasetsProperties = [
          ...this.bouquet.datasetsProperties,
          datasetProperties
        ]
        const { id, ...data } = this.bouquet.serialize()
        const response = client.update(id, data)
        return this.dispatch(response)
      },

      /**
       * Dispatch the response.
       *
       * @private
       * @param {object} response
       * @returns {this}
       */
      dispatch(response) {
        const { status, data, error } = response

        if (status === 200 || status === 201) {
          this.bouquet = Bouquet.deserialize(data)
          return this
        }

        if (status === 400 || status === 404) {
          this.error = error
          return this
        }

        throw new UnknownError(JSON.stringify(response))
      }
    }
  })
}
