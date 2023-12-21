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
    return await this.request({
      url: this.url(true),
      method: 'get',
      params: {
        for: subjectId,
        page
      }
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
      data: postForm
    })
  }
}
