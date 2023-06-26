import { watch } from "vue"
import { defineStore } from "pinia"

import config from "@/config.js"
import OrganizationsAPI from "../services/api/resources/OrganizationsAPI"

const api = new OrganizationsAPI()


export const useDatasetStore = defineStore("dataset", {
  state: () => ({
    data: []
  }),
  getters: {
    // TODO: maybe move to actions since we have a param
    datasetsForOrg: (state) => {
      return (org_id) => {
        return state.data.filter(d => d.organization.id === org_id || d.organization.slug === org_id)
      }
    }
  },
  actions: {
    getOrAddDatasetsForOrg (org_id) {
      const existing = this.datasetsForOrg(org_id)
      if (existing.length) return existing.value
      // TODO: handle pagination
      const { data, error } = api.getDatasets(org_id)
      // TODO: maybe move to async/await in API to avoid watchers (but will bubble up to component?)
      watch(data, (_data) => {
        if (_data.data) {
          this.add(_data.data)
        }
      })
      return this.datasetsForOrg(org_id)
    },
    add (datasets) {
      datasets.forEach(d => this.data.push(d))
    },
  }
})


export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    data: []
  }),
  actions: {
    fillFromConfig (withDatasets = false) {
      config.organizations.forEach((org_id) => {
        this.getOrAdd(org_id, withDatasets)
      })
      return this.data
    },
    add (org) {
      this.data.push(org)
      return org
    },
    getOrAdd (org_id, withDatasets = false) {
      const existing = this.data.find(o => o.value.id === org_id || o.value.slug === org_id)
      if (existing) return existing.value
      const { data } = api.get(org_id)
      if (withDatasets) this.getOrAddDatasetForOrg(org_id)
      return this.add(data)
    },
    getOrAddDatasetForOrg (org_id) {
      const dStore = useDatasetStore()
      return dStore.getOrAddDatasetsForOrg(org_id)
    }
  }
})
