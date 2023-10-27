import axios from 'axios'
import { getActivePinia } from 'pinia'

import config from '@/config'

const browser = typeof window !== 'undefined'
const pinia = getActivePinia()

if (browser) {
  const { toast } = await import('vue3-toastify')
  const { useLoading } = await import('vue-loading-overlay')
  const $loading = useLoading()
}

if (pinia) {
  const { storeToRefs } = await import('pinia')
  const { useUserStore } = await import('../../store/UserStore')
  const { isLoggedIn, token } = storeToRefs(useUserStore())
}

const instance = axios.create()

// inject token in requests if user is loggedIn
instance.interceptors.request.use(
  (config) => {
    if (getActivePinia()) {
      if (isLoggedIn) {
        config.headers = {
          Authorization: `Bearer ${token}`
        }
      }
    }

    return config
  },
  (error) => Promise.reject(error)
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
  base_url = `${config.datagouvfr.base_url}/api`
  version = '1'
  endpoint = ''

  constructor({ endpoint }) {
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
    const res = await instance[method](url, params)
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
   * @param {string} entityId
   * @returns {Promise}
   */
  async get(entityId) {
    const url = `${this.url()}/${entityId}/`
    return await this.makeRequestAndHandleResponse(url)
  }

  /**
   * Get an entity's detail from its id, without wrapper
   *
   * @param {string} entityId
   * @returns {Promise}
   */
  async _get(entityId) {
    const url = `${this.url()}/${entityId}/`
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
   * @param {string} entityId
   * @param {object} data
   * @returns {Promise}
   */
  async update(entityId, data) {
    return await this.makeRequestAndHandleResponse(
      `${this.url()}/${entityId}/`,
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
    return instance.delete(`${this.url()}/${entityId}/`).then(
      (response) => response,
      (error) => error.response
    )
  }
}
