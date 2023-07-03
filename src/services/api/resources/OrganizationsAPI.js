import DatagouvfrAPI from "../DatagouvfrAPI"

export default class OrganizationsAPI extends DatagouvfrAPI {
  endpoint = "organizations"

  /**
   * Get datasets for an organization
   *
   * @param {str} org_id
   * @returns {object}
   */
  async getDatasets (org_id, page = 1) {
    const url = `${this.url()}/${org_id}/datasets/?page=${page}`
    return await this.makeRequestAndHandleResponse(url)
  }
}
