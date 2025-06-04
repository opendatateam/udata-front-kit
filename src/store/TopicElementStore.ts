import { defineStore } from 'pinia'

import type {
  DatasetElement,
  ElementClass,
  GenericElement
} from '@/model/topic'
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
    async getTopicElements(
      topicId: string,
      excludes: ElementClass[] = ['Reuse']
    ): Promise<DatasetElement[]> {
      if (topicId in this.datasetsElements) {
        return this.datasetsElements[topicId]
      }
      // TODO: handle pagination, max out page_size for now
      const response = await topicAPI.get({
        entityId: `${topicId}/elements`,
        params: { page_size: 1000 }
      })
      // TODO: maybe introduce a `class__ne=xxx` in API or smtg
      this.datasetsElements[topicId] = response.data.filter(
        (element: GenericElement) => !excludes.includes(element.element.class)
      )
      return this.datasetsElements[topicId]
    }
  }
})
