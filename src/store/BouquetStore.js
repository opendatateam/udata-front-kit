import { defineStore } from "pinia"
import TopicsAPI from "../services/api/resources/TopicsAPI"
import config from "@/config"

const topicsAPI = new TopicsAPI()

export const useBouquetStore = defineStore("bouquet", {
  state: () => ({
    data: [],
  }),
  actions: {
    /**
     * Filter a list of bouquets related to Ecospheres
     *
     * @param {Array} bouquets
     * @returns {Array}
     */
    filter (bouquets) {
      return bouquets.filter(bouquet => {
        return bouquet.tags.includes(config.universe_name)
          && bouquet.id !== config.universe_topic_id
          && bouquet.slug !== config.universe_topic_id
      })
    },
    /**
     * Load Ecospheres related bouquets from API
     *
     * @returns {Array<object>}
     */
    async loadBouquets () {
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
     * Get a bouquet from store
     *
     * @param {string} slug
     * @returns {object}
     */
    get (slug) {
      return this.data.find(b => b.slug === slug)
    },
    /**
     * Get a single bouquet from store or API
     *
     * @param {string} slug
     * @returns {object}
     */
    async load (slug) {
      const existing = this.get(slug)
      if (existing) return existing
      return await topicsAPI.get(slug)
    },
    /**
     * Create a bouquet
     *
     * @param {object} bouquet
     * @returns {object}
     */
    async create (bouquet) {
      const res = await topicsAPI.create(bouquet)
      this.data.push(res)
      return res
    },
    /**
     * Update a bouquet
     *
     * @param {string} bouquet_id
     * @param {object} data
     * @returns {object}
     */
    async update (bouquet_id, data) {
      const res = await topicsAPI.update(bouquet_id, data)
      const idx = this.data.findIndex(b => b.id === bouquet_id)
      this.data[idx] = res
      return res
    },
  },
})
