import type { AxiosResponseData } from '@/model/api'
import type { GenericElement } from '@/model/topic'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class TopicsAPI extends DatagouvfrAPI {
  endpoint = 'topics'
  version = 2

  async createElements(
    topicId: string,
    elements: GenericElement[]
  ): Promise<GenericElement[]> {
    return await this.request({
      url: `${this.url(false)}/${topicId}/elements/`,
      method: 'post',
      data: elements,
      toasted: true,
      authenticated: true
    })
  }

  async updateElement(
    topicId: string,
    elementId: string,
    element: GenericElement
  ): Promise<GenericElement> {
    return await this.request({
      url: `${this.url(false)}/${topicId}/elements/${elementId}/`,
      method: 'put',
      data: element,
      toasted: true,
      authenticated: true
    })
  }

  async deleteElement(topicId: string, elementId: string): Promise<void> {
    return await this.request({
      url: `${this.url(false)}/${topicId}/elements/${elementId}/`,
      method: 'delete',
      toasted: true,
      authenticated: true
    })
  }

  async search(params: object): Promise<AxiosResponseData> {
    return await this.request({
      url: `${this.url()}/search/`,
      method: 'get',
      params,
      authenticated: false
    })
  }
}
