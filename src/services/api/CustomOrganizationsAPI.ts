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

  constructor(pageKey: string) {
    this.baseUrl = config.organizations[pageKey]
    if (!this.baseUrl) {
      throw new Error(`No organizations base URL found for ${pageKey}`)
    }
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
