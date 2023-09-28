import DatagouvfrAPI from "../DatagouvfrAPI"

export default class UserAPI extends DatagouvfrAPI {
  endpoint = "me"

  /**
   * Get currently logged-in user infos
   *
   * @returns {object}
   */
  async getProfile () {
    return await this.makeRequestAndHandleResponse(`${this.url()}/`)
  }
}
