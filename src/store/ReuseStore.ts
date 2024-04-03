import { defineStore } from 'pinia'

import type { Reuse, ReuseType } from '@/model/reuse'

import ReusesAPI from '../services/api/resources/ReusesAPI'

const reusesAPI = new ReusesAPI()

interface RootState {
  data: Record<string, Reuse[]>
}

export const useReuseStore = defineStore('reuse', {
  state: (): RootState => ({
    data: {}
  }),
  actions: {
    /**
     * Get reuses for a dataset from store
     */
    getReusesForDataset(datasetId: string) {
      return this.data[datasetId]
    },
    /**
     * Async function to trigger API fetch of reuses for an object
     */
    async loadReusesForDataset(datasetId: string) {
      const existing = this.getReusesForDataset(datasetId)
      if (existing !== undefined) return existing
      const reuses = await reusesAPI.getReusesForDataset(datasetId)
      this.addReuses(datasetId, reuses.data)
      return this.getReusesForDataset(datasetId)
    },
    /**
     * Store the result of a reuses fetch operation for a dataset in store
     */
    addReuses(datasetId: string, reuses: Reuse[]) {
      this.data[datasetId] = reuses
    },
    /**
     * Get reuses types from the API
     */
    async getTypes(): Promise<ReuseType[]> {
      return await reusesAPI.get('types')
    }
  }
})
