import { defineStore } from 'pinia'

import type {
  Discussion,
  DiscussionForm,
  DiscussionId,
  DiscussionResponse,
  PostForm,
  SubjectId
} from '@/model/discussion'
import DiscussionsAPI from '@/services/api/resources/DiscussionsAPI'

const discussionsAPI = new DiscussionsAPI()

export const useDiscussionStore = defineStore('discussion', {
  state: () => {
    const data: Record<SubjectId, DiscussionResponse[]> = {}
    const closedCount: Record<SubjectId, number> = {}
    return { data, closedCount }
  },
  actions: {
    /**
     * Replace a discussion in every cached page for a subject
     */
    replaceDiscussion(subjectId: SubjectId, discussion: Discussion) {
      if (this.data[subjectId] === undefined) return
      this.data[subjectId] = this.data[subjectId].map((dPage) => {
        dPage.data = dPage.data.map((d) => {
          return d.id === discussion.id ? discussion : d
        })
        return dPage
      })
    },
    /**
     * Add a post to a discussion
     */
    async createPost(
      subjectId: SubjectId,
      discussionId: DiscussionId,
      postForm: PostForm
    ): Promise<Discussion | undefined> {
      const discussion: Discussion | undefined =
        await discussionsAPI.createPost(discussionId, postForm)
      if (discussion === undefined) return
      if (
        postForm.close &&
        discussion.closed &&
        this.closedCount[subjectId] !== undefined
      ) {
        this.closedCount[subjectId] += 1
      }
      this.replaceDiscussion(subjectId, discussion)
      return discussion
    },
    /**
     * Update a discussion's title
     */
    async updateDiscussionTitle(
      subjectId: SubjectId,
      discussionId: DiscussionId,
      title: string
    ): Promise<Discussion | undefined> {
      const discussion: Discussion | undefined =
        await discussionsAPI.updateDiscussion(discussionId, title)
      if (discussion === undefined) return
      this.replaceDiscussion(subjectId, discussion)
      return discussion
    },
    /**
     * Update a comment given its id
     */
    async updateComment(
      subjectId: SubjectId,
      discussionId: DiscussionId,
      commentId: string,
      comment: string
    ): Promise<Discussion | undefined> {
      const discussion: Discussion | undefined =
        await discussionsAPI.updateComment(discussionId, commentId, comment)
      if (discussion === undefined) return
      this.replaceDiscussion(subjectId, discussion)
      return discussion
    },
    /**
     * Delete a discussion and all its comments
     */
    async deleteDiscussion(
      subjectId: SubjectId,
      discussionId: DiscussionId
    ): Promise<void> {
      await discussionsAPI.deleteDiscussion(discussionId)
      if (this.data[subjectId] === undefined) return
      const wasClosed = this.data[subjectId]
        .flatMap((dPage) => dPage.data)
        .find((d) => d.id === discussionId)?.closed
      if (wasClosed && this.closedCount[subjectId] !== undefined) {
        this.closedCount[subjectId] -= 1
      }
      this.data[subjectId] = this.data[subjectId].map((dPage) => {
        dPage.data = dPage.data.filter((d) => d.id !== discussionId)
        dPage.total -= 1
        return dPage
      })
    },
    /**
     * Delete a comment given its id
     */
    async deleteComment(
      subjectId: SubjectId,
      discussionId: DiscussionId,
      commentId: string
    ): Promise<void> {
      await discussionsAPI.deleteComment(discussionId, commentId)
      if (this.data[subjectId] === undefined) return
      this.data[subjectId] = this.data[subjectId].map((dPage) => {
        dPage.data = dPage.data.map((d) => {
          if (d.id !== discussionId) return d
          d.discussion = d.discussion.filter((c) => c.id !== commentId)
          return d
        })
        return dPage
      })
    },
    /**
     * Refresh discussions for a subject, by loading the first page
     */
    async reloadForSubject(subjectId: SubjectId) {
      if (this.data[subjectId] === undefined) return
      // TODO: refactor data structure to comply with this rule
      delete this.data[subjectId]
      return await this.loadDiscussionsForSubject(subjectId)
    },
    /**
     * Add a discussion
     */
    async createDiscussion(
      discussionForm: DiscussionForm
    ): Promise<Discussion> {
      const discussion: Discussion = await discussionsAPI.create({
        data: discussionForm
      })
      await this.reloadForSubject(discussionForm.subject.id)
      return discussion
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
     * Get the cached closed discussions count for a subject
     */
    getClosedCountForSubject(subjectId: SubjectId): number | undefined {
      return this.closedCount[subjectId]
    },
    /**
     * Async function to trigger API fetch of the closed discussions count for a subject
     */
    async loadClosedCountForSubject(subjectId: SubjectId): Promise<number> {
      const existing = this.getClosedCountForSubject(subjectId)
      if (existing !== undefined) return existing
      const count = await discussionsAPI.getClosedCount(subjectId)
      this.closedCount[subjectId] = count
      return count
    },
    /**
     * Get a discussions pagination object for a given dataset, from store infos
     */
    getDiscussionsPaginationForSubject(subjectId: SubjectId) {
      const discussions = this.getDiscussionsForSubject(subjectId)
      if (discussions === undefined) return []
      const nbPages = Math.ceil(discussions.total / discussions.page_size)
      return [...Array(nbPages).keys()].map((page) => {
        page += 1
        return {
          label: page.toString(),
          href: '#',
          title: `Page ${page}`
        }
      })
    }
  }
})
