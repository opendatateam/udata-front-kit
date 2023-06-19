import config from "@/config"
import { useFetch } from "../../composables/fetch"

/**
 * A composable wrapper around data.gouv.fr's API
 *
 * Composable because HTTP methods wrapper return {ComposableFetchResult}
 *
 * This class must be subclassed to provide at least an `endpoint` attr,
 * e.g. OrganizationsAPI will declare `endpoint = organizations`.
 */
export default class DatagouvfrAPI {
  base_url = config.datagouvfr_api_url
  version = "1"
  endpoint = ""

  url () {
    return `${this.base_url}/${this.version}/${this.endpoint}`
  }

  /**
   * Get an entity's detail from its id
   * @param {string} entity_id
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  get (entity_id) {
    const url = `${this.url()}/${entity_id}`
    return useFetch(url)
  }

  /**
   * List entities
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  list () {
    return useFetch(this.url())
  }
}
