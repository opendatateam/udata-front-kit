import type { SubjectId } from '@/model/discussion'

import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for an object
   */
  async getDiscussions(subjectId: SubjectId, page: number = 1): Promise<any> {
    const url = `${this.url()}/?for=${subjectId}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
