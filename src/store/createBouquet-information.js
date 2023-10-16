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
    serialize(payload) {
      const serializedPayload = {
        extras: {
          'information:subject': payload.information?.subject || this.subject,
          'information:theme': payload.information?.theme || this.theme,
          'information:sub-theme': payload.information?.subTheme || this.subTheme
        }
      }

      return {...serializedPayload, ...payload}
    },
    deserialize(payload) {
      return {
          subject: payload.data.extras['information:subject'],
          theme: payload.data.extras['information:theme'],
          subTheme: payload.data.extras['information:sub-theme']
        }
    }
  }
})
