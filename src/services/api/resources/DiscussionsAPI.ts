import type {
  CommentForm,
  Discussion,
  DiscussionId,
  DiscussionResponse,
  SubjectId
} from '@/model/discussion'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  commentUrl(discussionId: DiscussionId, commentId: string): string {
    return `${this.url()}/${discussionId}/comments/${commentId}/`
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
   * Get a single discussion, without error toast
   */
  async getDiscussion(discussionId: DiscussionId): Promise<Discussion> {
    return await this.get({
      entityId: discussionId,
      toasted: false,
      // Needed so the API resolves `permissions` against the current user
      authenticated: true
    })
  }

  /**
   * Get the number of closed discussions for an object
   */
  async getClosedCount(subjectId: SubjectId): Promise<number> {
    const response: DiscussionResponse = await this.list({
      params: {
        for: subjectId,
        closed: 'true',
        page_size: 1
      }
    })
    return response.total
  }

  /**
   * Create a comment on a discussion
   */
  async createComment(
    discussionId: DiscussionId,
    commentForm: CommentForm
  ): Promise<Discussion> {
    const url = `${this.url()}/${discussionId}/`
    return await this.request({
      url,
      method: 'post',
      data: commentForm,
      authenticated: true,
      toasted: true
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
   * Update a comment given its id
   */
  async updateComment(
    discussionId: DiscussionId,
    commentId: string,
    comment: string
  ): Promise<Discussion> {
    return await this.request({
      url: this.commentUrl(discussionId, commentId),
      method: 'put',
      data: { comment },
      authenticated: true,
      toasted: true
    })
  }

  /**
   * Delete a comment given its id
   */
  async deleteComment(
    discussionId: DiscussionId,
    commentId: string
  ): Promise<void> {
    await this.request({
      url: this.commentUrl(discussionId, commentId),
      method: 'delete',
      authenticated: true,
      toasted: true
    })
  }
}
