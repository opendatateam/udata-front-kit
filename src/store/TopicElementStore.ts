import { defineStore } from 'pinia'

import type { DatasetElement, ElementClass } from '@/model/topic'
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
      classes: Array<undefined | ElementClass> = ['Dataset', undefined]
    ): Promise<DatasetElement[]> {
      if (topicId in this.datasetsElements) {
        return this.datasetsElements[topicId]
      }
      const promises = classes.map((elementClass) =>
        topicAPI.get({
          entityId: `${topicId}/elements`,
          params: {
            // TODO: handle pagination, max out page_size for now
            page_size: 1000,
            // undefined is mapped as string 'None' in the API
            class: elementClass || 'None'
          }
        })
      )
      const responses = await Promise.all(promises)
      this.datasetsElements[topicId] = responses.flatMap(
        (response) => response.data
      )
      return this.datasetsElements[topicId]
    }
  }
})
