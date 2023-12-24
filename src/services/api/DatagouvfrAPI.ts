import axios from 'axios'
import { toast } from 'vue3-toastify'

import config from '@/config'

import type {
  DatagouvfrAPIArgs,
  AxiosResponseData,
  RequestConfig,
  AxiosError,
  URLParams
} from '../../model/api'
import { useUserStore } from '../../store/UserStore'

const instance = axios.create()

// inject token in requests if user is loggedIn
instance.interceptors.request.use(
  async (config) => {
    const store = useUserStore()
    if (store.$state.isLoggedIn) {
      config.headers.Authorization = `Bearer ${store.$state.token}`
    }
    return config
  },
  async (error) => await Promise.reject(error)
)

/**
 * A wrapper around data.gouv.fr's API
 *
 * This class must be subclassed to provide at least an `endpoint` attr,
 * e.g. OrganizationsAPI will declare `endpoint = organizations`.
 */
export default class DatagouvfrAPI {
  baseUrl = `${config.datagouvfr.base_url}/api`
  version = 1
  endpoint = ''
  httpClient = instance
  toasted = true

  constructor(args: DatagouvfrAPIArgs = {}) {
    const { baseUrl, version, endpoint, httpClient } = args
    this.baseUrl = baseUrl ?? this.baseUrl
    this.version = version ?? this.version
    this.endpoint = endpoint ?? this.endpoint
    this.httpClient = httpClient ?? this.httpClient
  }

  url(suffixed: boolean = false): string {
    return `${this.baseUrl}/${this.version}/${this.endpoint}${
      suffixed ? '/' : ''
    }`
  }

  /**
   * Make a `method` request to URL and optionnaly attach a toaster to the error
   */
  async request(config: RequestConfig): Promise<AxiosResponseData> {
    const response = await this.httpClient({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    }).catch((error: AxiosError) => {
      if (this.toasted) {
        toast(error.message, { type: 'error', autoClose: false })
      }
      throw error
    })
    return response.data
  }

  /**
   * Get an entity's detail from its id
   */
  async get(entityId: string, params?: URLParams): Promise<AxiosResponseData> {
    const url = `${this.url()}/${entityId}/`
    return await this.request({ url, method: 'get', params })
  }

  /**
   * List entities
   */
  async list(params?: URLParams): Promise<AxiosResponseData> {
    return await this.request({
      url: this.url(true),
      method: 'get',
      params
    })
  }

  /**
   * Create an entity (POST)
   */
  async create(data: object): Promise<AxiosResponseData> {
    return await this.request({
      url: this.url(true),
      method: 'post',
      data
    })
  }

  /**
   * Update an entity (PUT)
   */
  async update(entityId: string, data: object): Promise<AxiosResponseData> {
    const url = `${this.url()}/${entityId}/`
    return await this.request({
      url,
      method: 'put',
      data
    })
  }

  /**
   * Delete an entity (DELETE)
   */
  async delete(entityId: string): Promise<AxiosResponseData> {
    const url = `${this.url()}/${entityId}/`
    return await this.request({
      url,
      method: 'delete'
    })
  }
}
