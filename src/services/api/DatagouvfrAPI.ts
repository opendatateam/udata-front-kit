import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

import config from '@/config'
import type { Response } from '@/model'

// FIXME: the client should not depend be aware of the store.
import { useUserStore } from '../../store/UserStore'

const $loading = useLoading()
const instance = axios.create()

// inject token in requests if user is loggedIn
instance.interceptors.request.use(
  (config) => {
    const store = useUserStore()
    if (store.$state.isLoggedIn) {
      config.headers = {
        Authorization: `Bearer ${store.$state.token}`
      }
    }

    return config
  },
  async (error) => await Promise.reject(error)
)

/**
 * A composable wrapper around data.gouv.fr's API
 *
 * Composable because HTTP methods wrapper return {ComposableFetchResult}
 *
 * This class must be subclassed to provide at least an `endpoint` attr,
 * e.g. OrganizationsAPI will declare `endpoint = organizations`.
 */
export default class DatagouvfrAPI {
  baseUrl = `${config.datagouvfr.base_url}/api`
  version = '1'
  endpoint = ''
  httpClient = instance

  constructor(args = {}) {
    const { baseUrl, version, endpoint, httpClient } = args
    this.baseUrl = baseUrl || this.baseUrl
    this.version = version || this.version
    this.endpoint = endpoint || this.endpoint
    this.httpClient = httpClient || this.httpClient
  }

  url() {
    return `${this.baseUrl}/${this.version}/${this.endpoint}`
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
    const res = await this.httpClient[method](url, params)
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
    const loader = $loading.show()
    return await this.request(url, method, params)
      .catch((error) => {
        if (error?.message) {
          toast(error.message, { type: 'error', autoClose: false }) // TODO: Refacto to handle the error
          return error.response
        }
      })
      .finally(() => {
        loader.hide()
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
   * @param {object} [queryParams]
   * @returns {Promise}
   */
  async list(queryParams = {}) {
    const qs = new URLSearchParams(queryParams).toString()
    return await this.makeRequestAndHandleResponse(`${this.url()}/?${qs}`)
  }

  /**
   * List entities, without wrapper
   *
   * @param {object} [queryParams]
   * @returns {Promise}
   */
  async _list(queryParams = {}) {
    const qs = new URLSearchParams(queryParams).toString()
    return await this.request(`${this.url()}/?${qs}`)
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
   * Base function for HTTP calls (without error handling)
   *
   * @todo Remove this function once all API calls are all handled this way:
   *       leaving the error handling to the caller (store).
   *
   * @param {string} url
   * @param {object} data
   * @returns {Promise<Response>}
   */
  async _create(url: string, data = {}): Promise<Response> {
    return await this.httpClient.post(url, data).then(
      (response) => response,
      (error) => this.#handleError(error)
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
   * @param {string} entityId - A UUID entity id
   * @returns {Promise<Response>}
   */
  async delete(entityId: string): Promise<Response> {
    return await this.httpClient.delete(`${this.url()}/${entityId}/`).then(
      (response) => response,
      (error) => this.#handleError(error)
    )
  }

  #handleError({ response, message }): Response {
    return {
      ...(response && { status: response.status }),
      ...(message && { error: { message } })
    }
  }
}
