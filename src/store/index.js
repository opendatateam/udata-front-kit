import { watch } from "vue"
import { defineStore } from "pinia"

import config from "@/config.js"
import OrganizationsAPI from "../services/api/resources/OrganizationsAPI"

const api = new OrganizationsAPI()


export const useDatasetStore = defineStore("dataset", {
  state: () => ({
    data: {}
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
     * Get datasets in store for an org and a page
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
     * Get from store or fetch from API datasets for an org and a page
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {Array<object>}
     */
    getOrAddDatasetsForOrg (org_id, page = 1) {
      const existing = this.getDatasetsForOrg(org_id, page)
      if (existing.data) return existing
      const { data, error } = api.getDatasets(org_id, page)
      // TODO: maybe move to async/await in API to avoid watchers (but will bubble up to component?)
      watch(data, (_data) => {
        if (_data.data) {
          // store the full results with metadata
          this.add(org_id, _data)
        }
      })
      return this.getDatasetsForOrg(org_id, page)
    },
    /**
     * Store the result of a datasets fetch operation for an org in store
     *
     * @param {string} org_id
     * @param {object} res
     */
    add (org_id, res) {
      this.data[org_id] = [...(this.data[org_id] || []), res]
    },
  }
})


export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    data: []
  }),
  actions: {
    /**
     * Init the organization store from the config file values
     *
     * @returns {Array<object>}
     */
    fillFromConfig () {
      config.organizations.forEach((org_id) => {
        this.getOrAdd(org_id)
      })
      return this.data
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
     * Get an org from the store or from the API if not cached
     *
     * @param {string} org_id
     * @returns {object}
     */
    getOrAdd (org_id) {
      const existing = this.data.find(o => o.value.id === org_id || o.value.slug === org_id)
      if (existing) return existing.value
      const { data } = api.get(org_id)
      return this.add(data)
    },
    /**
     * Get datasets for an org from the store or from the API ()
     *
     * @param {str} org_id
     * @returns {object}
     */
    getOrAddDatasetForOrg (org_id) {
      const dStore = useDatasetStore()
      return dStore.getOrAddDatasetsForOrg(org_id)
    }
  }
})
