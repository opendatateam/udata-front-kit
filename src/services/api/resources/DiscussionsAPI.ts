import type {
  SubjectId,
  PostForm,
  Discussion,
  DiscussionResponse,
  DiscussionId
} from '@/model/discussion'

import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for an object
   */
  async getDiscussions(
    subjectId: SubjectId,
    page: number = 1
  ): Promise<DiscussionResponse> {
    const url = `${this.url()}/?for=${subjectId}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }

  /**
   * Create a post on a discussion
   */
  async createPost(
    discussionId: DiscussionId,
    postForm: PostForm
  ): Promise<Discussion> {
    const url = `${this.url()}/${discussionId}/`
    return await this.makeRequestAndHandleResponse(url, 'post', postForm)
  }
}
