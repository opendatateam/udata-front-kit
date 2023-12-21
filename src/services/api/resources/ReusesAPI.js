import DatagouvfrAPI from '../DatagouvfrAPI'

export default class ReusesAPI extends DatagouvfrAPI {
  endpoint = 'reuses'

  /**
   * Get reuses for a dataset
   *
   * @param {str} dataset_id
   * @returns {object}
   */
  async getReuses(datasetId) {
    return this.request({
      url: this.url(true),
      method: 'get',
      params: {
        dataset: datasetId
      }
    })
  }
}
