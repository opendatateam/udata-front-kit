import { defineStore } from 'pinia'

const serializeInformation = (params) => {
  return {
    extras: {
      'information:subject': params?.subject || null,
      'information:theme': params?.theme || null,
      'information:sub-theme': params?.subTheme || null
    }
  }
}

const deserializeInformation = (params) => {
  return {
    subject: params?.extras?.['information:subject'] || null,
    theme: params?.extras?.['information:theme'] || null,
    subTheme: params?.extras?.['information:sub-theme'] || null
  }
}

const useBouquetInformationStore = defineStore('createBouquet-information', {
  state: () => ({
    subject: null,
    theme: null,
    subTheme: null
  }),

  actions: {
    serialize(params = {}) {
      return serializeInformation({
        ...this.$state,
        ...params
      })
    },

    deserialize(params = {}) {
      this.$state = deserializeInformation({
        extras: {
          ...serializeInformation(this.$state).extras,
          ...(params?.extras || {})
        }
      })

      return this
    }
  }
})

export {
  serializeInformation,
  deserializeInformation,
  useBouquetInformationStore
}
