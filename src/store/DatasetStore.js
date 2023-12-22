import { defineStore } from 'pinia'

import DatasetsAPI from '../services/api/resources/DatasetsAPI'

const datasetsApi = new DatasetsAPI()
const datasetsApiv2 = new DatasetsAPI({ version: 2 })

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
  state: () => ({
    data: {},
    resourceTypes: [],
    sort: null
  }),
  actions: {
    /**
     * Get a datasets pagination object for a given org, from store infos
     *
     * @param {str} orgId
     * @returns {Array<object>}
     */
    getDatasetsPaginationForOrg(orgId) {
      const datasets = this.getDatasetsForOrg(orgId)
      if (!datasets.data) return []
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
     *
     * @param {string} orgId
     * @param {number?} page
     * @param {string?} sort Sort order requested
     * @returns {Array<object>}
     */
    getDatasetsForOrg(orgId, page = 1, sort = '-created') {
      if (this.sort !== sort) return []
      if (!this.data[orgId]) return []
      return this.data[orgId].find((d) => d.page === page) || []
    },
    /**
     * Async function to trigger API fetch of an org's datasets if not known in store
     *
     * @param {string} orgId
     * @param {number?} page
     * @param {string?} sort Sort order requested
     * @returns {Array<object>}
     */
    async loadDatasetsForOrg(orgId, page = 1, sort = '-created') {
      const existing = this.getDatasetsForOrg(orgId, page, sort)
      if (existing.data) return existing
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
     *
     * @param {string} orgId
     * @param {object} res
     * @param {string} sort Sort order used for this res
     */
    addDatasets(orgId, res, sort) {
      // reset org data if another sort has been requested
      if (this.sort !== sort) this.data[orgId] = []
      this.sort = sort
      this.data[orgId] = [...(this.data[orgId] || []), res]
    },
    /**
     * Get a dataset from the store given its id
     *
     * @param {string} datasetId
     * @returns {object|undefined}
     */
    get(datasetId) {
      // flatten pages data for each organization
      // TODO: suboptimal store structure for this use case, see later if org oriented or flat is better
      const flattened = Object.keys(this.data)
        .map((k) => this.data[k].map((a) => a.data).flat())
        .flat()
      return flattened.find((d) => {
        return d.id === datasetId || d.slug === datasetId
      })
    },
    /**
     * Add an "orphan" dataset to the store
     *
     * @param {object} dataset
     * @returns {object}
     */
    addOrphan(dataset) {
      this.addDatasets('_orphan', {
        data: [dataset]
      })
      return dataset
    },
    /**
     * Async function to trigger API fetch of a dataset if not known in store
     *
     * @param {str} datasetId
     * @returns {object}
     */
    async load(datasetId) {
      const existing = this.get(datasetId)
      if (existing) return existing
      const dataset = await datasetsApiv2.get(datasetId)
      if (!dataset) return
      return this.addOrphan(dataset)
    },
    /**
     * Load multiple datasets from API via a HATEOAS rel
     *
     * @param {Object} rel - HATEOAS rel for datasets
     * @returns {Array<object>}
     */
    async loadMultiple(rel) {
      let response = await datasetsApiv2.request({
        url: rel.href,
        method: 'get'
      })
      let datasets = response.data
      this.addDatasets('orphan', response)
      while (response.next_page) {
        response = await datasetsApiv2.request({
          url: response.next_page,
          method: 'get'
        })
        datasets = [...datasets, ...response.data]
        this.addDatasets('orphan', response)
      }
      return datasets
    },

    async getLicense(license) {
      const response = await datasetsApi.get('licenses')
      return response.find((l) => l.id === license)
    }
  }
})
