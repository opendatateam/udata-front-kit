import { defineStore } from "pinia";
import DiscussionsAPI from "../services/api/resources/DiscussionsAPI";

const discussionsAPI = new DiscussionsAPI();

export const useDiscussionStore = defineStore("discussion", {
  state: () => ({
    data: {},
  }),
  actions: {
    /**
     * Get discussions for a dataset from store
     *
     * @param {str} dataset_id
     * @returns {Array<object>}
     */
    getDiscussionsForDataset(dataset_id, page = 1) {
      if (!this.data[dataset_id]) return {};
      return this.data[dataset_id].find((d) => d.page == page) || {};
    },
    /**
     * Async function to trigger API fetch of discussions for a dataset
     *
     * @param {string} dataset_id
     * @returns {Array<object>}
     */
    async loadDiscussionsForDataset(dataset_id, page = 1) {
      const existing = this.getDiscussionsForDataset(dataset_id, page);
      if (existing.data) return existing;
      const discussions = await discussionsAPI.getDiscussions(dataset_id, page);
      this.addDiscussions(dataset_id, discussions);
      return this.getDiscussionsForDataset(dataset_id, page);
    },
    /**
     * Store the result of a discussions fetch operation for a dataset in store
     *
     * @param {string} dataset_id
     * @param {Array<object>} res
     */
    addDiscussions(dataset_id, res) {
      if (!res) return;
      this.data[dataset_id] = [...(this.data[dataset_id] || []), res];
    },
    /**
     * Get a discussions pagination object for a given dataset, from store infos
     *
     * @param {str} dataset_id
     * @returns {Array<object>}
     */
    getDiscussionsPaginationForDataset(dataset_id) {
      const discussions = this.getDiscussionsForDataset(dataset_id);
      if (!discussions.data) return [];
      const nbPages = Math.ceil(discussions.total / discussions.page_size);
      return [...Array(nbPages).keys()].map((page) => {
        page += 1;
        return {
          label: page,
          href: "#",
          title: `Page ${page}`,
        };
      });
    },
  },
});
