import { defineStore } from 'pinia'

import config from '@/config'
import type { Topic } from '@/model'

import TopicsAPI from '../services/api/resources/TopicsAPI'
import { useUserStore } from './UserStore'

const topicsAPI = new TopicsAPI()
const topicsAPIv2 = new TopicsAPI({ version: 2 })

export interface RootState {
  data: Topic[]
  isLoaded: boolean
}

export const useTopicStore = defineStore('topic', {
  state: (): RootState => ({
    data: [],
    // flag for initial/remote loading of data
    isLoaded: false
  }),
  actions: {
    /**
     * Load topics to store from a list of ids and API
     */
    async loadTopicsFromList(topics: Topic[]) {
      this.data = []
      for (const topic of topics) {
        const res = await topicsAPI.get(topic.id)
        this.data.push(res)
      }
    },
    /**
     * Filter a list of topics related to the current universe and private or not
     */
    filter(topics: Topic[]) {
      const draftFilter = (topic: Topic): boolean => {
        if (!topic.private) return true
        return useUserStore().hasEditPermissions(topic)
      }
      return topics.filter((topic) => {
        return topic.id !== config.universe.topic_id && draftFilter(topic)
      })
    },
    /**
     * Load universe related topics from API
     */
    async loadTopicsForUniverse(): Promise<Topic[]> {
      if (this.isLoaded) return this.data
      let response = await topicsAPIv2.list({
        page_size: config.website.pagination_sizes.topics_list,
        tag: config.universe.name
      })
      await useUserStore().waitForStoreInit()
      this.data = this.filter(response.data)
      while (response.next_page !== null) {
        response = await topicsAPIv2.request({
          url: response.next_page,
          method: 'get'
        })
        this.data = [...this.data, ...this.filter(response.data)]
      }
      this.isLoaded = true
      return this.data
    },
    /**
     * Get a topic from store
     */
    get(slugOrId: string): Topic | undefined {
      return this.data.find((b) => b.slug === slugOrId || b.id === slugOrId)
    },
    /**
     * Get a single topic from store or API
     */
    async load(slugOrId: string) {
      const existing = this.get(slugOrId)
      if (existing !== undefined) return existing
      return await topicsAPIv2.get(slugOrId)
    },
    /**
     * Create a topic
     */
    async create(topic: any): Promise<Topic> {
      const res = await topicsAPI.create(topic)
      this.data.push(res)
      return res
    },
    /**
     * Update a topic
     */
    async update(topicId: string, data: any): Promise<Topic> {
      const res = await topicsAPI.update(topicId, data)
      const idx = this.data.findIndex((b) => b.id === topicId)
      this.data[idx] = res
      return res
    },
    /**
     * Delete a topic
     */
    async delete(topicId: string) {
      await topicsAPI.delete(topicId)
      const idx = this.data.findIndex((b) => b.id === topicId)
      this.data.splice(idx, 1)
    }
  }
})
