import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DiscussionsAPI extends DatagouvfrAPI {
  endpoint = 'discussions'

  /**
   * Get discussions for a dataset
   *
   * @param {str} object_id
   * @param {number} page
   * @returns {object}
   */
  async getDiscussions(object_id: string, page = 1) {
    const url = `${this.url()}/?for=${object_id}&page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
