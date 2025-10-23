import type { Rel } from '@datagouv/components-next'
import { defineStore } from 'pinia'

import config from '@/config'
import type { ResourceData, ResourceType } from '@/model/resource'
import DatasetsAPI from '@/services/api/resources/DatasetsAPI'

const datasetsApi = new DatasetsAPI()
const datasetsApiv2 = new DatasetsAPI({ version: 2 })
const pageSize: number = config.website.pagination_sizes.files_list

export interface RootState {
  data: Record<string, ResourceData[]>
  resourceTypes: ResourceType[]
}

export const useResourceStore = defineStore('resource', {
  state: (): RootState => ({
    data: {},
    resourceTypes: []
  }),
  actions: {
    /**
     * Load resources from the API via a HATEOAS rel
     * Handle first page for every type and stores results for caching.
     */
    async loadResources(datasetId: string, rel: Rel): Promise<ResourceData[]> {
      if (datasetId in this.data) {
        return this.data[datasetId]
      }
      if (this.resourceTypes.length === 0) {
        this.resourceTypes = await datasetsApi.get({
          entityId: 'resource_types'
        })
      }
      this.data[datasetId] = []
      for (const type of this.resourceTypes) {
        const url = new URL(rel.href)
        url.searchParams.set('page_size', pageSize.toFixed(0))
        url.searchParams.set('type', type.id)
        const response = await datasetsApi.request({
          url: url.toString(),
          method: 'get'
        })
        this.data[datasetId].push({
          currentPage: 1,
          resources: response.data,
          total: response.total,
          totalWithoutFilter: response.total,
          type
        })
      }
      return this.data[datasetId]
    },

    /**
     * Fetch dataset's resources for a given page and type, without storage
     */
    async fetchDatasetResources(
      datasetId: string,
      page: number,
      typeId: string | null = null,
      q = ''
    ) {
      return await datasetsApiv2.getResourcesForDataset(
        datasetId,
        page,
        pageSize,
        typeId,
        q
      )
    }
  }
})
