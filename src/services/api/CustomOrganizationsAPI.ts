import config from '@/config'
import type {
  AxiosError,
  AxiosResponseData,
  RequestConfig,
  URLParams
} from '@/model/api'
import { toastHttpError } from '@/utils/error'
import axios from 'axios'

export default class CustomOrganizationsAPI {
  baseUrl: string
  toasted: boolean

  // pageKey is a dotted path for network pages (e.g. `simm.datasets` -> organizations.simm.datasets).
  constructor(pageKey: string) {
    const resolved = pageKey
      .split('.')
      .reduce<unknown>(
        (obj, key) => (obj as Record<string, unknown> | undefined)?.[key],
        config.organizations
      )
    if (typeof resolved !== 'string') {
      throw new Error(`No organizations base URL found for ${pageKey}`)
    }
    this.baseUrl = resolved
    this.toasted = true
  }

  async request(requestConfig: RequestConfig): Promise<AxiosResponseData> {
    const response = await axios(requestConfig).catch((error: AxiosError) => {
      if (this.toasted && requestConfig.toasted === true) {
        toastHttpError(error)
      }
      throw error
    })
    return response.data
  }

  async get(url: string, params?: URLParams, toasted = true) {
    return await this.request({
      url,
      method: 'get',
      params,
      toasted
    })
  }

  async list() {
    return await this.get(this.baseUrl)
  }
}
