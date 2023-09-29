import { useFetch } from "../../../composables/fetch"
import DatagouvfrAPI from "../DatagouvfrAPI"

export default class UserAPI extends DatagouvfrAPI {
  endpoint = "me"

  /**
   * Get currently logged-in user infos
   * Does not use wrapped makeRequestAndHandleResponse to be able
   * to respond on errors
   *
   * @returns {object}
   */
  async getProfile () {
    return await useFetch(`${this.url()}/`)
  }
}
