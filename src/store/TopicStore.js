import { defineStore } from 'pinia'

import config from '@/config'

import TopicsAPI from '../services/api/resources/TopicsAPI'

const topicsAPI = new TopicsAPI()

export const useTopicStore = defineStore('topic', {
  state: () => ({
    data: []
  }),
  actions: {
    /**
     * Load topics to store from a list of ids and API
     *
     * @param {*} topics
     */
    async loadTopicsFromList(topics) {
      this.data = []
      for (const topic of topics) {
        const res = await topicsAPI.get(topic.id)
        this.data.push(res)
      }
    },
    /**
     * Filter a list of topics related to the current universe
     *
     * @param {Array} topics
     * @returns {Array}
     */
    filter(topics) {
      return topics.filter((topic) => {
        return (
          topic.tags.includes(config.universe.name) &&
          topic.id !== config.universe.topic_id
        )
      })
    },
    /**
     * Load universe related topics from API
     *
     * @returns {Array<object>}
     */
    async loadTopicsForUniverse() {
      if (this.data.length > 0) return this.data
      let response = await topicsAPI._list()
      this.data = this.filter(response.data)
      while (response.next_page) {
        response = await topicsAPI.request(response.next_page)
        this.data = [...this.data, ...this.filter(response.data)]
      }
      return this.data
    },
    /**
     * Get a topic from store
     *
     * @param {string} slugOrId
     * @returns {object}
     */
    get(slugOrId) {
      return this.data.find((b) => b.slug === slugOrId || b.id === slugOrId)
    },
    /**
     * Get a single topic from store or API
     *
     * @param {string} slugOrId
     * @returns {object}
     */
    async load(slugOrId) {
      const existing = this.get(slugOrId)
      if (existing) return existing
      return await topicsAPI.get(slugOrId)
    },
    /**
     * Create a topic
     *
     * @param {object} topic
     * @returns {object}
     */
    async create(topic) {
      const res = await topicsAPI.create(topic)
      this.data.push(res)
      return res
    },
    /**
     * Update a topic
     *
     * @param {string} topic_id
     * @param {object} data
     * @returns {object}
     */
    async update(topic_id, data) {
      const res = await topicsAPI.update(topic_id, data)
      const idx = this.data.findIndex((b) => b.id === topic_id)
      this.data[idx] = res
      return res
    }
  }
})
