import { defineStore } from 'pinia'

import ReusesAPI from '../services/api/resources/ReusesAPI'

const reusesAPI = new ReusesAPI()

export const useReuseStore = defineStore('reuse', {
  state: () => ({
    data: {}
  }),
  actions: {
    /**
     * Get reuses for a dataset from store
     *
     * @param {str} dataset_id
     * @returns {Array<object>}
     */
    getReusesForDataset(dataset_id) {
      return this.data[dataset_id]
    },
    /**
     * Async function to trigger API fetch of reuses for a dataset
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadReusesForDataset(dataset_id) {
      const existing = this.getReusesForDataset(dataset_id)
      if (existing) return existing
      const reuses = await reusesAPI.getReuses(dataset_id)
      this.addReuses(dataset_id, reuses.data)
      return this.getReusesForDataset(dataset_id)
    },
    /**
     * Store the result of a reuses fetch operation for a dataset in store
     *
     * @param {string} dataset_id
     * @param {Array<object>} res
     */
    addReuses(dataset_id, res) {
      if (!res) return
      this.data[dataset_id] = res
    },

    async getTypes() {
      return await reusesAPI.get('/types')
    }
  }
})
