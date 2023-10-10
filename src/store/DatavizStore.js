import { defineStore } from "pinia"

export const datavizStore = defineStore("datavizStore", {
  state: () => ({
    data: {},
    formatedData: {},
    chartName: {},
    chartUnit: {},
  }),
  getters: {
  },
  actions: {
    async getDataFromUrl(url) {
      const response = await fetch(url)
      const data = await response.json()
      this.data[url] = data
      const labels = []
      const values = []
      data.values.forEach((item) => {
        values.push(item["y1"])
        labels.push(item["x"])
      })

      this.chartName[url] = data.nom
      this.chartUnit[url] = data.unite
      this.formatedData[url] = {
        labels: labels,
        datasets: [
          {
            label: data.nom,
            borderColor: "#000091",
            data: values,
            type: 'line',
            pointRadius: 0,
            fill: {
              target: 'origin',
              above: 'rgb(255, 0, 0)',   // Area will be red above the origin
              below: 'rgb(0, 0, 255)'    // And blue below the origin
            }
          },
        ],
      }
    }
  },
})
