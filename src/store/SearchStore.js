import { defineStore } from "pinia";

import SearchAPI from "../services/api/SearchAPI";

const searchAPI = new SearchAPI();
const pageSize = 21;

export const useSearchStore = defineStore("search", {
  state: () => ({
    data: {},
  }),
  getters: {
    facets: (state) => {
      return state.data.facetDistribution || {};
    },
    datasets: (state) => {
      return state.data.hits || [];
    },
    pagination: (state) => {
      if (!state.data) return [];
      return [...Array(state.data.totalPages).keys()].map((page) => {
        page += 1;
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        };
      });
    },
  },
  actions: {
    async search(query, page = 1, filter = []) {
      const args = {
        hitsPerPage: pageSize,
        facets: ["organization.name"],
        page: page,
        filter: filter,
      };
      const results = await searchAPI.search(query, args);
      this.data = results;
    },
  },
});
