import { defineStore } from 'pinia'

import type {
  DatasetElement,
  ElementClass,
  GenericElement,
  Topic
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
    async getTopicElements({
      topicId,
      classes = ['Dataset', undefined],
      forceRefresh = false
    }: {
      topicId: string
      classes?: Array<undefined | ElementClass>
      forceRefresh?: boolean
    }): Promise<DatasetElement[]> {
      if (!forceRefresh && topicId in this.datasetsElements) {
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
    },
    async createElement(
      topicId: string,
      element: GenericElement
    ): Promise<Topic> {
      const topic = await topicAPI.createElements(topicId, [element])
      // refresh the stored topic elements
      this.getTopicElements({ topicId, forceRefresh: true })
      return topic
    }
  }
})
