import { defineStore } from 'pinia'

import type { GenericResponse as Response } from '@/model/api'
import type { SubjectId } from '@/model/discussion'

import DiscussionsAPI from '../services/api/resources/DiscussionsAPI'

const discussionsAPI = new DiscussionsAPI()

export const useDiscussionStore = defineStore('discussion', {
  state: () => {
    const data: Record<SubjectId, any[]> = {}
    return { data }
  },
  actions: {
    /**
     * Get discussions for a dataset from store
     */
    getDiscussionsForDataset(
      datasetId: SubjectId,
      page = 1
    ): Response | undefined {
      if (this.data[datasetId] === undefined) return
      return this.data[datasetId].find((d) => d.page === page)
    },
    /**
     * Async function to trigger API fetch of discussions for a dataset
     */
    async loadDiscussionsForDataset(
      datasetId: SubjectId,
      page = 1
    ): Promise<Response | undefined> {
      const existing = this.getDiscussionsForDataset(datasetId, page)
      if (existing !== undefined) return existing
      const discussions = await discussionsAPI.getDiscussions(datasetId, page)
      this.addDiscussions(datasetId, discussions)
      return this.getDiscussionsForDataset(datasetId, page)
    },
    /**
     * Store the result of a discussions fetch operation for a dataset in store
     */
    addDiscussions(datasetId: SubjectId, res: object[]) {
      const existing = this.data[datasetId] ?? []
      this.data[datasetId] = [...existing, res]
    },
    /**
     * Get a discussions pagination object for a given dataset, from store infos
     */
    getDiscussionsPaginationForDataset(datasetId: SubjectId): object[] {
      const discussions = this.getDiscussionsForDataset(datasetId)
      if (discussions === undefined) return []
      const nbPages = Math.ceil(discussions.total / discussions.page_size)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page,
          href: '#',
          title: `Page ${page}`
        }
      })
    }
  }
})
