import { defineStore } from 'pinia'

import type { BaseParams } from '@/model/api'
import type { DataserviceWithRel } from '@/model/dataservice'
import type { DatasetV2Response } from '@/model/dataset'
import DataservicesAPI from '@/services/api/resources/DataservicesAPI'

const api = new DataservicesAPI()

interface RootState {
  dataservices: DataserviceWithRel[]
  datasetsTotals: Record<string, { total: number; page_size: number }>
}

export const useDataserviceStore = defineStore('dataservice', {
  state: (): RootState => ({
    dataservices: [],
    datasetsTotals: {}
  }),
  getters: {
    getDatasetsPagination: (state) => (dataserviceId: string) => {
      const info = state.datasetsTotals[dataserviceId]
      if (!info) return []
      const nbPages = Math.ceil(info.total / info.page_size)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page.toString(),
          href: '#datasets',
          title: `Page ${page}`
        }
      })
    }
  },
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
      dataservice: DataserviceWithRel | undefined,
      page: number
    ): Promise<DatasetV2Response | null> {
      if (!dataservice) return null

      const url = new URL(dataservice.datasets.href)
      url.searchParams.set('page', page.toString())

      const response = await api.request({
        url: url.toString(),
        method: 'get'
      })

      // Store total and page_size for pagination
      this.datasetsTotals[dataservice.id] = {
        total: response.total,
        page_size: response.page_size
      }

      return response
    }
  }
})
