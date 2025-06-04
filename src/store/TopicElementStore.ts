import { defineStore } from 'pinia'

import type { DatasetElement } from '@/model/topic'
import TopicAPI from '@/services/api/resources/TopicsAPI'

const topicAPI = new TopicAPI({ version: 2 })

export interface RootState {
  datasetsElements: Record<string, DatasetElement[]>
}

export const useTopicElementStore = defineStore('element', {
  state: (): RootState => ({
    datasetsElements: {}
  }),
  actions: {
    async getTopicElements(topicId: string): Promise<DatasetElement[]> {
      if (topicId in this.datasetsElements) {
        return this.datasetsElements[topicId]
      }
      // TODO: handle pagination, max out page_size for now
      const response = await topicAPI.get({
        entityId: `${topicId}/elements`,
        params: { page_size: 1000 }
      })
      this.datasetsElements[topicId] = response.data
      return this.datasetsElements[topicId]
    }
  }
})
