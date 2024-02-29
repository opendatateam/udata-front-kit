import { defineStore } from 'pinia'

import config from '@/config'

import OrganizationsAPI from '../services/api/resources/OrganizationsAPI'

const orgApi = new OrganizationsAPI()

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    // holds a paginated list of orgs
    // [
    //   {
    //     "page": 1,
    //     "orgs": []
    //   }, ...
    // ]
    data: [],
    // holds a non paginated lightweight-formatted list of all orgs
    flatData: []
  }),
  actions: {
    /**
     * Get an organizations pagination object from config infos
     *
     * @returns {Array<object>}
     */
    getPagination() {
      const pageSize = config.website.pagination_sizes.organizations_list
      const total = config.organizations.length
      const nbPages = Math.ceil(total / pageSize)
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
     * Get orgs list for a given page from store
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    getForPage(page = 1) {
      return this.data.find((d) => d.page === page)?.orgs || []
    },
    /**
     * Async function to trigger API fetch of orgs list for a page, using the config
     * and preserving the config file order
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadFromConfig(page = 1) {
      const pageSize = config.website.pagination_sizes.organizations_list
      const paginated = config.organizations.slice(
        pageSize * (page - 1),
        pageSize * page
      )
      await this.loadMultiple(paginated, page)
      return this.getForPage(page)
    },
    /**
     * Load multiple organizations in a lightweight format without pagination
     * Used for e.g. for filtering
     */
    async loadFromConfigFlat() {
      if (this.flatData.length > 0) return this.flatData
      const promises = config.organizations.map(async (orgId) => {
        return await orgApi.get(orgId, undefined, { 'x-fields': 'id,name' })
      })
      this.flatData = await Promise.all(promises)
      return this.flatData
    },
    /**
     * Load multiple organizations to store
     *
     * @param {Array<string>} org_ids
     * @param {number} page
     * @returns {Promise}
     */
    async loadMultiple(orgIds, page) {
      for (const orgId of orgIds) {
        const existing = this.get(orgId)
        if (existing) continue
        try {
          const org = await orgApi.get(orgId)
          this.add(org, page)
        } catch (e) {
          console.log(`Error fetching ${orgId}: ${e}`)
        }
      }
    },
    /**
     * Add an organization to the store
     *
     * @param {object} org
     * @param {number} page
     * @returns {object}
     */
    add(org, page) {
      const existing = this.data.find((d) => d.page === page)
      if (existing) {
        existing.orgs.push(org)
      } else {
        this.data.push({ page, orgs: [org] })
      }
      return org
    },
    /**
     * Get an org from store given its id
     *
     * @param {str} org_id
     * @returns {object|undefined}
     */
    get(orgId) {
      return this.data
        .map((d) => d.orgs)
        .flat()
        .find((o) => o.id === orgId || o.slug === orgId)
    },
    /**
     * Async function to trigger API fetch of an org if not known in store
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {object|undefined}
     */
    async load(orgId, page) {
      const existing = this.get(orgId)
      if (existing) return existing
      const org = await orgApi.get(orgId)
      return this.add(org, page)
    }
  }
})
