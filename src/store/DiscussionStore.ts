import { defineStore } from 'pinia'

import type {
  SubjectId,
  DiscussionResponse,
  DiscussionForm,
  Discussion
} from '@/model/discussion'

import DiscussionsAPI from '../services/api/resources/DiscussionsAPI'

const discussionsAPI = new DiscussionsAPI()

export const useDiscussionStore = defineStore('discussion', {
  state: () => {
    const data: Record<SubjectId, DiscussionResponse[]> = {}
    return { data }
  },
  actions: {
    /**
     * Refresh discussions for a subject, by loading the first page
     */
    async reloadForSubject(subjectId: SubjectId) {
      console.log('reloadForSubject', subjectId, this.data[subjectId])
      if (this.data[subjectId] === undefined) return
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.data[subjectId]
      return await this.loadDiscussionsForSubject(subjectId)
    },
    /**
     * Add a discussion
     */
    async createDiscussion(
      discussionForm: DiscussionForm
    ): Promise<Discussion> {
      const res = await discussionsAPI.create(discussionForm)
      await this.reloadForSubject(discussionForm.subject.id)
      return res
    },
    /**
     * Get discussions for a subject from store
     */
    getDiscussionsForSubject(
      subjectId: SubjectId,
      page = 1
    ): DiscussionResponse | undefined {
      if (this.data[subjectId] === undefined) return
      return this.data[subjectId].find((d) => d.page === page)
    },
    /**
     * Async function to trigger API fetch of discussions for a subject
     */
    async loadDiscussionsForSubject(
      subjectId: SubjectId,
      page = 1
    ): Promise<DiscussionResponse | undefined> {
      const existing = this.getDiscussionsForSubject(subjectId, page)
      if (existing !== undefined) return existing
      const discussions = await discussionsAPI.getDiscussions(subjectId, page)
      this.addDiscussions(subjectId, discussions)
      return this.getDiscussionsForSubject(subjectId, page)
    },
    /**
     * Store the result of a discussions fetch operation for a dataset in store
     */
    addDiscussions(subjectId: SubjectId, res: DiscussionResponse) {
      const existing = this.data[subjectId] ?? []
      this.data[subjectId] = [...existing, res]
    },
    /**
     * Get a discussions pagination object for a given dataset, from store infos
     */
    getDiscussionsPaginationForSubject(subjectId: SubjectId): object[] {
      const discussions = this.getDiscussionsForSubject(subjectId)
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