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
     * Get from store or fetch from API orgs list for a page, using the config
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    getOrAddListFromConfig (page = 1) {
      const pageSize = config.organizations_list_page_size
      config.organizations.slice(pageSize * (page - 1), pageSize * page).forEach((org_id) => {
        this.getOrAdd(org_id)
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
  }
})
