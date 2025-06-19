import type { Dataset } from '@datagouv/components'
import { defineStore } from 'pinia'

import type { BaseParams } from '@/model/api'
import type { DataserviceWithRel } from '@/model/dataservice'
import DataservicesAPI from '@/services/api/resources/DataservicesAPI'

const api = new DataservicesAPI()

interface RootState {
  dataservices: DataserviceWithRel[]
}

export const useDataserviceStore = defineStore('dataservice', {
  state: (): RootState => ({
    dataservices: []
  }),
  actions: {
    get(id_or_slug: string): DataserviceWithRel | undefined {
      return this.dataservices.find(
        (d) => d.id === id_or_slug || d.slug === id_or_slug
      )
    },
    async load(
      id_or_slug: string,
      params?: BaseParams
    ): Promise<DataserviceWithRel> {
      const existing = this.get(id_or_slug)
      if (existing) return existing
      const dataservice = await api.get({ entityId: id_or_slug, ...params })
      this.dataservices.push(dataservice)
      return dataservice
    },
    async getDatasetsForDataservice(
      dataservice: DataserviceWithRel | undefined
    ): Promise<Dataset[]> {
      if (!dataservice) return []
      const datasets = []
      let url = dataservice.datasets.href
      while (url) {
        const response = await api.request({
          url,
          method: 'get'
        })
        datasets.push(...response.data)
        url = response.next_page
      }
      return datasets
    }
  }
})
