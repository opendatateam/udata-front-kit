import type { Discussion, Response } from '@/model'

import DatagouvfrAPI from '../DatagouvfrAPI'

interface Args {
  subjectId: string
  page?: number
}

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for a subject.
   *
   * @param {Args}
   * @returns {Promise<Response<Discussion[]>>}
   */
  getDiscussions = async ({
    subjectId,
    page = 1
  }: Args): Promise<Response<Discussion[]>> => {
    const url: string = `${this.url()}/?for=${subjectId}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
