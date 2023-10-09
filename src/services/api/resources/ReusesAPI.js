import DatagouvfrAPI from '../DatagouvfrAPI'

export default class ReusesAPI extends DatagouvfrAPI {
  endpoint = 'reuses'

  /**
   * Get reuses for a dataset
   *
   * @param {str} dataset_id
   * @returns {object}
   */
  async getReuses(dataset_id) {
    const url = `${this.url()}/?dataset=${dataset_id}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
