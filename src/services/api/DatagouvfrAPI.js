import config from "@/config"
import { watch } from "vue"
import { useFetch } from "../../composables/fetch"
import { toast } from "vue3-toastify"
import { useLoading } from 'vue-loading-overlay'

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
  makeRequestAndHandleResponse (url) {
    const loader = $loading.show()
    const { data, error } = useFetch(url, () => loader.hide())
    // TODO: unwatch when request is done?
    watch(error, (errorValue) => {
      if (errorValue && errorValue.message) {
        toast(errorValue.message, {type: "error", autoClose: false})
      }
    })
    return { data, error }
  }

  /**
   * Get an entity's detail from its id
   *
   * @param {string} entity_id
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  get (entity_id) {
    const url = `${this.url()}/${entity_id}/`
    return this.makeRequestAndHandleResponse(url)
  }

  /**
   * List entities
   *
   * @returns {import("../../composables/fetch").ComposableFetchResult}
   */
  list () {
    return this.makeRequestAndHandleResponse(this.url())
  }
}
