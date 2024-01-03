import { defineStore } from 'pinia'

import config from '@/config'
import type { Topic } from '@/model'

import TopicsAPI from '../services/api/resources/TopicsAPI'

const topicsAPI = new TopicsAPI()
const topicsAPIv2 = new TopicsAPI({ version: 2 })

export interface RootState {
  data: Topic[]
}

export const useTopicStore = defineStore('topic', {
  state: (): RootState => ({
    data: []
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
     * Filter a list of topics related to the current universe
     */
    filter(topics: Topic[]) {
      return topics.filter((topic) => topic.id !== config.universe.topic_id)
    },
    /**
     * Load universe related topics from API
     */
    async loadTopicsForUniverse(): Promise<Topic[]> {
      if (this.data.length > 0) return this.data
      let response = await topicsAPIv2.list({
        page_size: config.website.pagination_sizes.topics_list,
        tag: config.universe.name
      })
      this.data = this.filter(response.data)
      while (response.next_page !== null) {
        response = await topicsAPIv2.request({
          url: response.next_page,
          method: 'get'
        })
        this.data = [...this.data, ...this.filter(response.data)]
      }
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
    async update(topicId: string, data: Topic): Promise<Topic> {
      const res = await topicsAPI.update(topicId, data)
      const idx = this.data.findIndex((b) => b.id === topicId)
      this.data[idx] = res
      return res
    }
  }
})
