import type { DatasetV2, License } from '@etalab/data.gouv.fr-components'
import { defineStore } from 'pinia'

import type { BaseParams } from '@/model/api'
import type { DatasetV2Response } from '@/model/dataset'

import DatasetsAPI from '../services/api/resources/DatasetsAPI'

const datasetsApi = new DatasetsAPI()
const datasetsApiv2 = new DatasetsAPI({ version: 2 })

export interface RootState {
  data: Record<string, DatasetV2Response[]>
  customData: DatasetV2Response[]
  resourceTypes: any[]
  sort: string | null
}

/**
 * An organization oriented and paginated store for datasets
 * data = {
 *   "{organization_id}": [{
 *     "page": 1,
 *     "total": 200,
 *     "data": [{dataset}, ...]
 *   }, ...]
 * }
 *
 * A special key `_orphans` exists for storing individual datasets if needed (ie w/o org and pagination)
 * This is useful when fetching a single dataset on a dataset page
 */
export const useDatasetStore = defineStore('dataset', {
  state: (): RootState => ({
    data: {},
    customData: [],
    resourceTypes: [],
    sort: null
  }),
  actions: {
    /**
     * Get a datasets pagination object for a given org, from store infos
     */
    getDatasetsPaginationForOrg(orgId: string) {
      const datasets = this.getDatasetsForOrg(orgId)
      if (datasets === undefined) return []
      const nbPages = Math.ceil(datasets.total / datasets.page_size)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page,
          href: '#',
          title: `Page ${page}`
        }
      })
    },
    /**
     * Get datasets from store for an org and a page
     */
    getDatasetsForOrg(
      orgId: string,
      page: number = 1,
      sort: string = '-created'
    ) {
      if (this.sort !== sort) return undefined
      if (this.data[orgId] === undefined) return undefined
      return this.data[orgId].find((d) => d.page === page)
    },
    /**
     * Async function to trigger API fetch of an org's datasets if not known in store
     */
    async loadDatasetsForOrg(
      orgId: string,
      page: number = 1,
      sort: string = '-created'
    ) {
      const existing = this.getDatasetsForOrg(orgId, page, sort)
      if (existing !== undefined) return existing
      const datasets = await datasetsApiv2.getDatasetsForOrganization(
        orgId,
        page,
        sort
      )
      this.addDatasets(orgId, datasets, sort)
      return this.getDatasetsForOrg(orgId, page, sort)
    },
    /**
     * Store the result of a datasets fetch operation for an org in store
     */
    addDatasets(orgId: string, res: DatasetV2Response, sort: string | null) {
      // reset org data if another sort has been requested
      if (this.data[orgId] === undefined) this.data[orgId] = []
      if (this.sort !== sort) this.data[orgId] = []
      this.sort = sort
      this.data[orgId] = [...this.data[orgId], res]
    },
    /**
     * Get a dataset from the store given its id
     */
    get(datasetId: string) {
      // flatten pages data for each organization
      // TODO: suboptimal store structure for this use case, see later if org oriented or flat is better
      const flattened = Object.keys(this.data)
        .map((k) => this.data[k].map((a) => a.data).flat())
        .flat()
      const foundDataset = flattened.find((d) => {
        return d.id === datasetId || d.slug === datasetId
      })
      return foundDataset
    },
    /**
     * Add an "orphan" dataset to the store
     */
    addOrphan(dataset: DatasetV2) {
      this.addDatasets(
        '_orphan',
        {
          data: [dataset],
          page: 1,
          page_size: 1,
          next_page: null,
          previous_page: null,
          total: 1
        },
        null
      )
      return dataset
    },
    /**
     * Async function to trigger API fetch of a dataset if not known in store
     */
    async load(datasetId: string, params?: BaseParams) {
      const existing = this.get(datasetId)
      if (existing !== undefined) return existing
      const dataset = await datasetsApiv2.get({
        entityId: datasetId,
        ...params
      })
      if (dataset === undefined) return
      return this.addOrphan(dataset)
    },
    /**
     * Load multiple datasets from API via a HATEOAS rel
     */
    async loadMultiple(rel: { href: string }): Promise<object> {
      let response = await datasetsApiv2.request({
        url: rel.href,
        method: 'get'
      })
      let datasets = response.data
      this.addDatasets('orphan', response, null)
      while (response.next_page !== null) {
        response = await datasetsApiv2.request({
          url: response.next_page,
          method: 'get'
        })
        datasets = [...datasets, ...response.data]
        this.addDatasets('orphan', response, null)
      }
      return datasets
    },

    async getLicense(license: string) {
      const response: License[] = await datasetsApi.get({
        entityId: 'licenses'
      })
      const foundLicense = response.find((l) => l.id === license)
      return foundLicense
    },
    /**
     * Fetch datasets by their IDs and store them in an array.
     * @param {string[]} datasetIds - The list of dataset IDs to fetch.
     */
    async loadDatasetsByIds(datasetIds: string[]) {
      let fetchedDatasets = []
      for (const datasetId of datasetIds) {
        const dataset = await datasetsApiv2.get({
          entityId: datasetId
        })
        if (dataset) {
          fetchedDatasets.push(dataset)
        }
      }
      this.addCustomDatasets(fetchedDatasets)

      // Retourner les datasets récupérés si besoin
      return fetchedDatasets
    },
    /**
     * Store the result of a datasets fetch operation for an org in store
     */
    addCustomDatasets(fetchedDatasets: DatasetV2Response[]) {
      this.customData = fetchedDatasets
    }
  }
})
