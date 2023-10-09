import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DatasetsAPI extends DatagouvfrAPI {
  endpoint = 'datasets'

  /**
   * Get datasets for an organization
   *
   * @param {str} org_id Technical org id
   * @param {number?} page
   * @param {str?} sort
   * @returns {object}
   */
  async getDatasetsForOrganization(org_id, page = 1, sort = '-created') {
    // WARNING: specify `-created` or another sort explicitely because default sort has a pagination issue
    const url = `${this.url()}/?organization=${org_id}&page=${page}&sort=${sort}&page_size=21`
    return await this.makeRequestAndHandleResponse(url)
  }
}
