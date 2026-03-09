import { defineStore } from 'pinia'

import type { ElementClass, GenericElement } from '@/model/topic'
import TopicAPI from '@/services/api/resources/TopicsAPI'

const topicAPI = new TopicAPI({ version: 2 })

export interface RootState<T extends GenericElement> {
  elements: Record<string, T[]>
}

export const useTopicElementStore = defineStore('element', {
  state: (): RootState<GenericElement> => ({
    elements: {}
  }),
  actions: {
    async getTopicElements<T extends GenericElement>({
      topicId,
      classes = ['Dataset', undefined],
      forceRefresh = false
    }: {
      topicId: string
      classes?: Array<undefined | ElementClass>
      forceRefresh?: boolean
    }): Promise<T[]> {
      if (!forceRefresh && topicId in this.elements) {
        return this.elements[topicId] as T[]
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
      this.elements[topicId] = responses.flatMap((response) => response.data)
      return this.elements[topicId] as T[]
    },
    async createElement<T extends GenericElement>(
      topicId: string,
      element: T
    ): Promise<T> {
      const createdElements = await topicAPI.createElements(topicId, [element])
      const createdElement = createdElements[0] as T

      // Update local state optimistically with the created element that now has an ID
      if (!this.elements[topicId]) {
        this.elements[topicId] = []
      }
      this.elements[topicId].push(createdElement)

      return createdElement
    },

    async updateElement(
      topicId: string,
      elementId: string,
      element: GenericElement
    ): Promise<GenericElement> {
      const updatedElement = await topicAPI.updateElement(
        topicId,
        elementId,
        element
      )

      // Update local state optimistically
      const elementIndex = this.elements[topicId].findIndex(
        (el) => el.id === elementId
      )
      this.elements[topicId][elementIndex] = updatedElement

      return updatedElement
    },

    async deleteElement(topicId: string, elementId: string): Promise<void> {
      await topicAPI.deleteElement(topicId, elementId)

      // Update local state optimistically
      this.elements[topicId] = this.elements[topicId].filter(
        (el) => el.id !== elementId
      )
    }
  }
})
