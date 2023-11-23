import type { DiscussionParams, DiscussionResponse } from '@/model'

import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for a dataset
   *
   * @param {str} dataset_id
   * @param {number} page
   * @returns {object}
   */
  async getDiscussions(dataset_id, page = 1) {
    const url = `${this.url()}/?for=${dataset_id}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }

  /**
   * Create a discussion (POST)
   *
   * @param {DiscussionParams} data
   * @returns {Promise<DiscussionResponse>}
   */
  async create(data: DiscussionParams): Promise<DiscussionResponse> {
    return await this._create(`${this.url()}/`, data)
  }
}
