import { defineStore } from 'pinia'

import { type SpatialCoverageLevel } from '@/model/spatial'
import SpatialAPI from '@/services/api/SpatialAPI'

const api = new SpatialAPI()

export const useSpatialStore = defineStore('spatial', {
  state: () => ({
    levels: [] as SpatialCoverageLevel[]
  }),
  actions: {
    async loadLevels(): Promise<SpatialCoverageLevel[]> {
      if (this.levels.length > 0) return this.levels
      this.levels = await api.getLevels()
      return this.levels
    },
    getLevelById(levelId: string): SpatialCoverageLevel | undefined {
      return this.levels.find((level) => level.id === levelId)
    }
  }
})
