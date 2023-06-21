import { defineStore } from "pinia"

import config from "@/config.js"
import OrganizationsAPI from "../services/api/resources/OrganizationsAPI"

export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    data: []
  }),
  actions: {
    fillFromConfig (withDatasets = false) {
      config.organizations.forEach((org_id) => {
        this.getOrAdd(org_id)
      })
      return this.data
    },
    add (org) {
      this.data.push(org)
      return org
    },
    getOrAdd (org_id) {
      const existing = this.data.find(o => o.value.id === org_id || o.value.slug === org_id)
      if (existing) {
        return existing.value
      }
      else {
        const api = new OrganizationsAPI()
        const { data } = api.get(org_id)
        return this.add(data)
      }
    }
  }
})
