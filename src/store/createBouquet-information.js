import { defineStore } from "pinia"

export const useBouquetInformationStore = defineStore("createBouquet-information", {
  state: () => ({
    subject: null,
    theme: null,
    subTheme: null
  }),
  actions: {
    create(response) {
      this.subject = response.data.extras.subject
      this.theme = response.data.extras.theme
      this.subTheme = response.data.extras['sub-theme']

      return this
    }
  }
})
