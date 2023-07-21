import config from "@/config"
import { useFetch } from "../../composables/fetch"
import { toast } from "vue3-toastify"
import { useLoading } from "vue-loading-overlay"

const $loading = useLoading()

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
   * Make a GET request to URL and attach a toaster to the error
   *
   * @param {string} url
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  async makeRequestAndHandleResponse (url) {
    const loader = $loading.show()
    return await useFetch(url, (error) => {
      if (error && error.message) {
        toast(error.message, {type: "error", autoClose: false})
      }
    }, () => loader.hide())
  }

  /**
   * Get an entity's detail from its id
   *
   * @param {string} entity_id
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  async get (entity_id) {
    const url = `${this.url()}/${entity_id}/`
    return await this.makeRequestAndHandleResponse(url)
  }

  /**
   * List entities
   *
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  async list () {
    return await this.makeRequestAndHandleResponse(this.url())
  }
}
