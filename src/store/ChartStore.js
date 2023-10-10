import { defineStore } from "pinia"
import config from "@/config"

export const useChartStore = defineStore("useChartStore", {
  state: () => ({
    data: null,
  }),
  getters: {
  },
  actions: {
    async getCharts(typeObject, id) {
      const base_url = `${config.datagouvfr_base_url}/api`
      this.data = null
      const response = await fetch(base_url + "/1/" + typeObject + "/" + id)
      const data = await response.json()
      if (data.extras && data.extras["config:charts"]) {
        this.data = data.extras["config:charts"]
      }
    }
  },
})
