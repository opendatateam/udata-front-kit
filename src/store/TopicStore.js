import { defineStore } from "pinia"
import TopicsAPI from "../services/api/resources/TopicsAPI"
const topicsAPI = new TopicsAPI()

export const useTopicStore = defineStore("useTopicStore", {
  state: () => ({
    data: [],
  }),
  getters: {
  },
  actions: {
    async getTopics (topics) {
      this.data = []
      for (const topic of topics) {
          let res = await topicsAPI.get(topic.id)
          this.data.push(res)
      }           
    },
    async getTopic(id){
      return await topicsAPI.get(id)
    }
  },
})
