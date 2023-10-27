import config from '@/config'

const browser = typeof window !== 'undefined'

// TODO: Refactor once #92 is fixed.
// https://github.com/ecolabdata/ecospheres-front/issues/92
if (browser) {
  const { toast } = await import('vue3-toastify')
  const { useLoading } = await import('vue-loading-overlay')
  const $loading = useLoading()
}

/**
 * A composable wrapper around data.gouv.fr's API
 *
 * Composable because HTTP methods wrapper return {ComposableFetchResult}
 *
 * This class must be subclassed to provide at least an `endpoint` attr,
 * e.g. OrganizationsAPI will declare `endpoint = organizations`.
 */
export default class DatagouvfrAPI {
  base_url = `${config.datagouvfr.base_url}/api`
  version = '1'
  endpoint = ''

  constructor({ client, endpoint }) {
    this.client = client
    this.endpoint = endpoint || this.endpoint
  }

  url() {
    return `${this.base_url}/${this.version}/${this.endpoint}`
  }

  /**
   * Base function for HTTP calls
   *
   * @param {string} url
   * @param {string} method
   * @param {object} params
   * @returns
   */
  async request(url, method = 'get', params = {}) {
    const res = await this.client[method](url, params)
    return res.data
  }

  /**
   * Make a `method` request to URL and attach a toaster to the error
   *
   * @param {string} url
   * @param {string} method
   * @param {object} params
   * @returns {Promise}
   */
  async makeRequestAndHandleResponse(url, method = 'get', params = {}) {
    if (browser) {
      const loader = $loading.show()
    }

    return this.request(url, method, params)
      .catch((error) => {
        if (error && error.message) {
          if (browser) {
            // TODO: Refactor to handle the error
            toast(error.message, { type: 'error', autoClose: false })
          }

          return error.response
        }
      })
      .finally(() => {
        if (browser) loader.hide()
      })
  }

  /**
   * Get an entity's detail from its id
   *
   * @param {string} entity_id
   * @returns {Promise}
   */
  async get(entity_id) {
    const url = `${this.url()}/${entity_id}/`
    return await this.makeRequestAndHandleResponse(url)
  }

  /**
   * Get an entity's detail from its id, without wrapper
   *
   * @param {string} entity_id
   * @returns {Promise}
   */
  async _get(entity_id) {
    const url = `${this.url()}/${entity_id}/`
    return await this.request(url)
  }

  /**
   * List entities
   *
   * @returns {Promise}
   */
  async list() {
    return await this.makeRequestAndHandleResponse(`${this.url()}/`)
  }

  /**
   * List entities, without wrapper
   *
   * @returns {Promise}
   */
  async _list() {
    return await this.request(`${this.url()}/`)
  }

  /**
   * Create an entity (POST)
   *
   * @param {object} data
   * @returns {Promise}
   */
  async create(data) {
    return await this.makeRequestAndHandleResponse(
      `${this.url()}/`,
      'post',
      data
    )
  }

  /**
   * Update an entity (PUT)
   *
   * @param {string} entity_id
   * @param {object} data
   * @returns {Promise}
   */
  async update(entity_id, data) {
    return await this.makeRequestAndHandleResponse(
      `${this.url()}/${entity_id}/`,
      'put',
      data
    )
  }

  /**
   * Delete an entity (DELETE)
   *
   * @param {string} entityId
   * @returns {Promise}
   */
  async delete(entityId) {
    return this.client.delete(`${this.url()}/${entityId}/`).then(
      (response) => response,
      (error) => this.#handleError(error)
    )
  }

  #handleError({ response, message }) {
    if (response) return { status: response.status }
    return { message }
  }
}
