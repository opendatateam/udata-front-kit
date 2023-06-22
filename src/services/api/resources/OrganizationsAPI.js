import DatagouvfrAPI from "../DatagouvfrAPI"

export default class OrganizationsAPI extends DatagouvfrAPI {
  endpoint = "organizations"

  /**
   * Get datasets for an organization
   *
   * @param {str} org_id
   * @returns {import("../../../composables/fetch").ComposableFetchResult}
   */
  getDatasets (org_id) {
    const url = `${this.url()}/${org_id}/datasets/`
    return this.makeRequestAndHandleResponse(url)
  }
}
