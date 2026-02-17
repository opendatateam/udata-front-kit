import { defineStore } from 'pinia'

import ReusesAPI from '@/services/api/resources/ReusesAPI'
import type { ReuseType } from '@datagouv/components-next'

const reusesAPI = new ReusesAPI()

interface RootState {
  types: ReuseType[] | null
}

export const useReuseStore = defineStore('reuse', {
  state: (): RootState => ({
    types: null
  }),
  actions: {
    async getTypes(): Promise<ReuseType[]> {
      if (this.types !== null) return this.types
      const types: ReuseType[] = await reusesAPI.get({ entityId: 'types' })
      this.types = types
      return types
    }
  }
})
