import type { SubjectId } from '@/model/discussion'

import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for a dataset
   */
  async getDiscussions(datasetId: SubjectId, page: number = 1): Promise<any> {
    const url = `${this.url()}/?for=${datasetId}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
