import { watch } from "vue"
import { defineStore } from "pinia"

import config from "@/config.js"
import OrganizationsAPI from "../services/api/resources/OrganizationsAPI"
import DatasetsAPI from "../services/api/resources/DatasetsAPI"

const orgApi = new OrganizationsAPI()
const datasetsApi = new DatasetsAPI()


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
export const useDatasetStore = defineStore("dataset", {
  state: () => ({
    data: {},
  }),
  actions: {
    /**
     * Get a datasets pagination object for a given org, from API infos
     *
     * @param {str} org_id
     * @returns {Array<object>}
     */
    getDatasetsPaginationForOrg(org_id) {
      const datasets = this.getDatasetsForOrg(org_id)
      if (!datasets.data) return []
      const nbPages = Math.ceil(datasets.total / datasets.page_size)
      return [...Array(nbPages).keys()].map(page => {
        page += 1
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        }
      })
    },
    /**
     * Get datasets from store for an org and a page
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {object}
     */
    getDatasetsForOrg (org_id, page = 1) {
      if (!this.data[org_id]) return {}
      return this.data[org_id].find(d => d.page == page) || {}
    },
    /**
     * Async function to trigger API fetch of an org's datasets if not known in store
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadDatasetsForOrg (org_id, page = 1) {
      const existing = this.getDatasetsForOrg(org_id, page)
      if (existing.data) return existing
      const datasets = await orgApi.getDatasets(org_id, page)
      this.addDatasets(org_id, datasets)
      return this.getDatasetsForOrg(org_id, page)
    },
    /**
     * Store the result of a datasets fetch operation for an org in store
     *
     * @param {string} org_id
     * @param {object} res
     */
    addDatasets (org_id, res) {
      this.data[org_id] = [...(this.data[org_id] || []), res]
    },
    /**
     * Get a dataset from the store given its id
     *
     * @param {string} dataset_id
     * @returns {object|undefined}
     */
    get (dataset_id) {
      // flatten pages data for each organization
      // TODO: suboptimal store structure for this use case, see later if org oriented or flat is better
      // TODO: try to simplify since no refs anymore
      const flattened = Object.keys(this.data).map(org_id => {
        return this.data[org_id].map(org_data => org_data.data)
      }).reduce((flat, toFlatten) => flat.concat(toFlatten), []).flat()
      return flattened.find(d => {
        return d.id === dataset_id || d.slug === dataset_id
      })
    },
    /**
     * Add an "orphan" dataset to the store
     *
     * @param {object} dataset
     * @returns {object}
     */
    addOrphan (dataset) {
      this.addDatasets("_orphan", {
        data: [dataset]
      })
      return dataset
    },
    /**
     * Async function to trigger API fetch of a dataset if not known in store
     *
     * @param {str} dataset_id
     * @returns {object}
     */
    async load (dataset_id) {
      const existing = this.get(dataset_id)
      if (existing) return existing
      const dataset = await datasetsApi.get(dataset_id)
      this.addOrphan(dataset)
    },
  }
})


export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    data: []
  }),
  actions: {
    /**
     * Get an organizations pagination object from config infos
     *
     * @returns {Array<object>}
     */
    getPagination () {
      const pageSize = config.organizations_list_page_size
      const total = config.organizations.length
      const nbPages = Math.ceil(total / pageSize)
      return [...Array(nbPages).keys()].map(page => {
        page += 1
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        }
      })
    },
    /**
     * Get orgs list for a given page from store
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    getForPage (page = 1) {
      const pageSize = config.organizations_list_page_size
      return this.data.slice(pageSize * (page - 1), pageSize * page)
    },
    /**
     * Async function to trigger API fetch of orgs list for a page, using the config
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadFromConfig (page = 1) {
      const pageSize = config.organizations_list_page_size
      config.organizations.slice(pageSize * (page - 1), pageSize * page).forEach((org_id) => {
        this.load(org_id)
      })
      return this.getForPage(page)
    },
    /**
     * Add an organization to the store
     *
     * @param {object} org
     * @returns {object}
     */
    add (org) {
      this.data.push(org)
      return org
    },
    /**
     * Get an org from store given its id
     *
     * @param {str} org_id
     * @returns {object|undefined}
     */
    get (org_id) {
      return this.data.find(o => o.id === org_id || o.slug === org_id)
    },
    /**
     * Async function to trigger API fetch of an org if not known in store
     *
     * @param {string} org_id
     * @returns {object|undefined}
     */
    async load (org_id) {
      const existing = this.get(org_id)
      if (existing) return existing
      const org = await orgApi.get(org_id)
      return this.add(org)
    },
  }
})
