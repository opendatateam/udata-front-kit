import { defineStore } from "pinia"

export const useBouquetInformationStore = defineStore("createBouquet-information", {
  state: () => ({
    subject: null,
    theme: null,
    subTheme: null
  }),
  actions: {
    create(response) {
      const information = this.serialize(response)
      this.subject = information.subject
      this.theme = information.theme
      this.subTheme = information.subTheme

      return this
    },
    deserialize(payload) {
      return {
          subject: payload.data.extras['information:subject'],
          theme: payload.data.extras['information:theme'],
          subTheme: payload.data.extras['information:sub-theme']
        }
    },
    serialize(payload) {
      const serializedPayload = {
        extras: {
          'information:subject': this.subject,
          'information:theme': this.theme,
          'information:sub-theme': this.subThem
        }
      }

      return {...serializedPayload, ...payload}
    }
  }
})
