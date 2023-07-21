import { defineStore } from "pinia"

import OrganizationsAPI from "../services/api/resources/OrganizationsAPI"
import config from "@/config.js"

const orgApi = new OrganizationsAPI()

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
     * and preserving the config file order
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadFromConfig (page = 1) {
      const pageSize = config.organizations_list_page_size
      const paginated = config.organizations.slice(pageSize * (page - 1), pageSize * page)
      for (const org_id of paginated) {
        await this.load(org_id)
      }
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
  },
})
