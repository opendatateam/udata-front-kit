import type { Organization } from '@datagouv/components'
import { defineStore } from 'pinia'

import config from '@/config'
import type { BaseParams } from '@/model/api'
import OrganizationsAPI from '@/services/api/resources/OrganizationsAPI'

const orgApi = new OrganizationsAPI()

interface LightweightOrganization {
  id: string
  name: string
}

interface PaginatedOrganizations {
  page: number
  orgs: Organization[]
}

interface RootState {
  data: PaginatedOrganizations[]
  flatData: LightweightOrganization[]
}

export const useOrganizationStore = defineStore('organization', {
  state: (): RootState => ({
    data: [],
    flatData: []
  }),
  actions: {
    /**
     * Get an organizations pagination object from config infos
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
     */
    getForPage(page = 1) {
      return this.data.find((d) => d.page === page)?.orgs ?? []
    },
    /**
     * Async function to trigger API fetch of orgs list for a page, using the config
     * and preserving the config file order
     */
    async loadFromConfig(page = 1) {
      const pageSize = config.website.pagination_sizes.organizations_list
      const paginated = config.organizations.slice(
        pageSize * (page - 1),
        pageSize * page
      )
      await this.loadMultipleByIds(paginated, page)
      return this.getForPage(page)
    },
    /**
     * Load multiple organizations in a lightweight format without pagination
     * Used for e.g. for filtering
     */
    async loadFromConfigFlat() {
      if (this.flatData.length > 0) return this.flatData
      const promises = config.organizations.map(async (orgId: string) => {
        return await orgApi.get({
          entityId: orgId,
          headers: { 'x-fields': 'id,name' }
        })
      })
      this.flatData = await Promise.all(promises)
      return this.flatData
    },
    /**
     * Load multiple organizations to store
     */
    async loadMultipleByIds(orgIds: string[], page: number) {
      for (const orgId of orgIds) {
        const existing = this.get(orgId)
        if (existing !== undefined) continue
        try {
          const org = await orgApi.get({ entityId: orgId })
          this.add(org, page)
        } catch (e) {
          console.log(
            `Error fetching ${orgId}: ${
              e instanceof Error ? e.message : String(e)
            }`
          )
        }
      }
    },
    /**
     * Add an organization to the store
     */
    add(org: Organization, page: number) {
      const existing = this.data.find((d) => d.page === page)
      if (existing !== undefined) {
        existing.orgs.push(org)
      } else {
        this.data.push({ page, orgs: [org] })
      }
      return org
    },
    /**
     * Get an org from store given its id
     */
    get(orgId: string) {
      return this.data
        .map((d) => d.orgs)
        .flat()
        .find((o) => o.id === orgId || o.slug === orgId)
    },
    /**
     * Get an org from store given its acronym
     */
    async getByAcronym(acronym: string) {
      const orgs = await this.loadFromConfig()
      return orgs.filter((org) => org.acronym?.toLowerCase() === acronym)
    },
    /**
     * Async function to trigger API fetch of an org if not known in store
     */
    async load(orgId: string, page: number, params?: BaseParams) {
      const existing = this.get(orgId)
      if (existing !== undefined) return existing
      const org = await orgApi.get({ entityId: orgId, ...params })
      return this.add(org, page)
    }
  }
})
