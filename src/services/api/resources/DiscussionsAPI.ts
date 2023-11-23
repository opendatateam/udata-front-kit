import DatagouvfrAPI from '../DatagouvfrAPI'
import type { DiscussionRequest } from '@/model'

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
   * Base function for HTTP calls (without error handling)
   *
   * @param {string} url
   * @param {string} method
   * @param {object} params
   * @returns {Promise}
   */
  async _request(url, method = 'get', params = {}) {
    return await this.httpClient[method](url, params)
  }

  /**
   * Create an discussion (POST)
   *
   * @param {object} data
   * @returns {object}
   */
  async create(data: DiscussionRequest): Promise<DiscussionRequest> {
    return await this.request(`${this.url()}/`, 'post', data)
  }
}
