import { merge } from 'lodash/fp/object'
import { defineStore } from 'pinia'

import {
  deserializeDatause,
  serializeDatause
} from '@/store/createBouquet-datause'

const serializeDatauses = (params) => {
  return params?.reduce(
    (datauses, datause) => {
      return {
        extras: {
          datauses: [
            ...datauses.extras.datauses,
            ...serializeDatause(datause).extras.datauses
          ]
        }
      }
    },
    { extras: { datauses: [] } }
  )
}

const deserializeDatauses = (params) => {
  return (
    params?.extras?.datauses?.reduce(
      (datauses, datause) => {
        return {
          datauses: [
            ...datauses.datauses,
            deserializeDatause(serializeDatauses([datause]))
          ]
        }
      },
      { datauses: [] }
    ) || { datauses: [] }
  )
}

const useBouquetDatausesStore = defineStore('createBouquet-datauses', {
  state: () => ({
    datauses: []
  }),

  actions: {
    serialize(params = []) {
      return serializeDatauses(
        params.reduce((datauses, datause) => {
          if (this.$state.datauses.length > datauses.length) {
            return [
              ...datauses,
              merge(this.$state.datauses[datauses.length], datause)
            ]
          } else {
            return [...datauses, datause]
          }
        }, [])
      )
    },

    deserialize(params = {}) {
      this.$state = deserializeDatauses({
        extras: {
          ...serializeDatauses(this.$state.datauses).extras,
          ...(params?.extras || {})
        }
      })

      return this
    }
  }
})

export { serializeDatauses, deserializeDatauses, useBouquetDatausesStore }
