import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'vue3-toastify'

import config from '@/config'

import { useUserStore } from '../../store/UserStore'

const instance = axios.create()

// inject token in requests if user is loggedIn
instance.interceptors.request.use(
  (config) => {
    const store = useUserStore()
    if (store.$state.isLoggedIn) {
      config.headers.Authorization = `Bearer ${store.$state.token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

interface DatagouvfrAPIArgs {
  baseUrl?: string
  version?: number
  endpoint?: string
  httpClient?: AxiosInstance
}

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'

interface RequestConfig {
  url: string
  method: HttpMethod
  params?: object
  data?: object
  toasted?: boolean
}

type ResponseDataPromise = Promise<AxiosResponse['data']>

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
  async request(config: RequestConfig): ResponseDataPromise {
    const response = await this.httpClient({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    }).catch((error: AxiosError) => {
      if (config.toasted === true && error.message !== undefined) {
        toast(error.message, { type: 'error', autoClose: false })
      }
      throw error
    })
    return response.data
  }

  /**
   * Get an entity's detail from its id
   */
  async get(entityId: string, params?: object): ResponseDataPromise {
    const url = `${this.url()}/${entityId}/`
    return await this.request({ url, method: 'get', params })
  }

  /**
   * List entities
   */
  async list(queryParams: Record<string, string> = {}): ResponseDataPromise {
    const qs = new URLSearchParams(queryParams).toString()
    return await this.request({ url: `${this.url()}/?${qs}`, method: 'get' })
  }

  /**
   * Create an entity (POST)
   */
  async create(data: object): ResponseDataPromise {
    return await this.request({
      url: this.url(true),
      method: 'post',
      data
    })
  }

  /**
   * Update an entity (PUT)
   */
  async update(entityId: string, data: object): ResponseDataPromise {
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
  async delete(entityId: string): ResponseDataPromise {
    const url = `${this.url()}/${entityId}/`
    return await this.request({
      url,
      method: 'delete'
    })
  }
}
