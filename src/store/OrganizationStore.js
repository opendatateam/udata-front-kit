import { defineStore } from "pinia";

import OrganizationsAPI from "../services/api/resources/OrganizationsAPI";
import config from "@/config.js";

const orgApi = new OrganizationsAPI();

export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    // holds a paginated list of orgs
    // [
    //   {
    //     "page": 1,
    //     "orgs": []
    //   }, ...
    // ]
    data: [],
  }),
  actions: {
    /**
     * Get an organizations pagination object from config infos
     *
     * @returns {Array<object>}
     */
    getPagination() {
      const pageSize = config.organizations_list_page_size;
      const total = config.organizations.length;
      const nbPages = Math.ceil(total / pageSize);
      return [...Array(nbPages).keys()].map((page) => {
        page += 1;
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        };
      });
    },
    /**
     * Get orgs list for a given page from store
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    getForPage(page = 1) {
      return this.data.find((d) => d.page == page)?.orgs || [];
    },
    /**
     * Async function to trigger API fetch of orgs list for a page, using the config
     * and preserving the config file order
     *
     * @param {number} page
     * @returns {Array<object>}
     */
    async loadFromConfig(page = 1) {
      const pageSize = config.organizations_list_page_size;
      const paginated = config.organizations.slice(
        pageSize * (page - 1),
        pageSize * page
      );
      await this.loadMultiple(paginated, page);
      return this.getForPage(page);
    },
    /**
     * Load multiple organisations to store
     *
     * @param {Array<string>} org_ids
     * @param {number} page
     * @returns {Promise}
     */
    async loadMultiple(org_ids, page) {
      for (const org_id of org_ids) {
        const existing = this.get(org_id);
        if (existing) continue;
        try {
          const org = await orgApi._get(org_id);
          this.add(org, page);
        } catch (e) {
          console.log(`Error fetching ${org_id}: ${e}`);
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
      const existing = this.data.find((d) => d.page == page);
      if (existing) {
        existing.orgs.push(org);
      } else {
        this.data.push({ page, orgs: [org] });
      }
      return org;
    },
    /**
     * Get an org from store given its id
     *
     * @param {str} org_id
     * @returns {object|undefined}
     */
    get(org_id) {
      return this.data
        .map((d) => d.orgs)
        .flat()
        .find((o) => o.id === org_id || o.slug === org_id);
    },
    /**
     * Async function to trigger API fetch of an org if not known in store
     *
     * @param {string} org_id
     * @param {number} page
     * @returns {object|undefined}
     */
    async load(org_id, page) {
      const existing = this.get(org_id);
      if (existing) return existing;
      const org = await orgApi.get(org_id);
      return this.add(org, page);
    },
  },
});
