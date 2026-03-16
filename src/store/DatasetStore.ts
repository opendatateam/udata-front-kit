import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { defineStore } from 'pinia'

import type { BaseParams } from '@/model/api'
import DatasetsAPI from '@/services/api/resources/DatasetsAPI'

const datasetsApiv2 = new DatasetsAPI({ version: 2 })

interface RootState {
  datasets: DatasetV2WithFullObject[]
}

export const useDatasetStore = defineStore('datasetFull', {
  state: (): RootState => ({
    datasets: []
  }),
  actions: {
    get(datasetIdOrSlug: string): DatasetV2WithFullObject | undefined {
      return this.datasets.find(
        (d) => d.id === datasetIdOrSlug || d.slug === datasetIdOrSlug
      )
    },
    async load(datasetIdOrSlug: string, params?: BaseParams) {
      const existing = this.get(datasetIdOrSlug)
      if (existing !== undefined) return existing
      const dataset = (await datasetsApiv2.get({
        entityId: datasetIdOrSlug,
        headers: { 'X-Get-Datasets-Full-Objects': 'True' },
        ...params
      })) as DatasetV2WithFullObject
      this.datasets.push(dataset)
      return dataset
    }
  }
})
