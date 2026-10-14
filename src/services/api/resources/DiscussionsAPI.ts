import type {
  Discussion,
  DiscussionId,
  DiscussionResponse,
  PostForm,
  SubjectId
} from '@/model/discussion'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  commentUrl(discussionId: DiscussionId, index: number): string {
    return `${this.url()}/${discussionId}/comments/${index}/`
  }

  /**
   * Get discussions for an object
   */
  async getDiscussions(
    subjectId: SubjectId,
    page: number = 1
  ): Promise<DiscussionResponse> {
    return await this.list({
      params: {
        for: subjectId,
        page
      },
      // Needed so the API resolves `permissions` against the current user
      authenticated: true
    })
  }

  /**
   * Create a post on a discussion
   */
  async createPost(
    discussionId: DiscussionId,
    postForm: PostForm
  ): Promise<Discussion> {
    const url = `${this.url()}/${discussionId}/`
    return await this.request({
      url,
      method: 'post',
      data: postForm,
      authenticated: true
    })
  }

  /**
   * Update a discussion's title
   */
  async updateDiscussion(
    discussionId: DiscussionId,
    title: string
  ): Promise<Discussion> {
    return await this.update({
      entityId: discussionId,
      data: { title }
    })
  }

  /**
   * Delete a discussion and all its comments
   */
  async deleteDiscussion(discussionId: DiscussionId): Promise<void> {
    await this.delete({ entityId: discussionId })
  }

  /**
   * Update a comment given its index in the discussion
   */
  async updateComment(
    discussionId: DiscussionId,
    index: number,
    comment: string
  ): Promise<Discussion> {
    return await this.request({
      url: this.commentUrl(discussionId, index),
      method: 'put',
      data: { comment },
      authenticated: true
    })
  }

  /**
   * Delete a comment given its index in the discussion
   */
  async deleteComment(
    discussionId: DiscussionId,
    index: number
  ): Promise<void> {
    await this.request({
      url: this.commentUrl(discussionId, index),
      method: 'delete',
      authenticated: true
    })
  }
}
