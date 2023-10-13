import { defineStore } from "pinia"

export const useBouquetInformationStore = defineStore("createBouquet-information", {
  state: () => ({
    subject: null,
    theme: null,
    subTheme: null
  }),
  actions: {
    create(response) {
      this.subject = response.data.extras['information:subject']
      this.theme = response.data.extras['information:theme']
      this.subTheme = response.data.extras['information:sub-theme']

      return this
    }
  }
})
