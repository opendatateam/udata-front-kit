import type { GenericElement, Topic } from '@/model/topic'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class TopicsAPI extends DatagouvfrAPI {
  endpoint = 'topics'

  async createElements(
    topicId: string,
    elements: GenericElement[]
  ): Promise<Topic> {
    return await this.request({
      url: `${this.url(false)}/${topicId}/elements/`,
      method: 'post',
      data: elements,
      toasted: true,
      authenticated: true
    })
  }

  async getTopicByTag(tag: string): Promise<Topic | null> {
    const response = await this.request({
      url: `${this.url(false)}/?tag=${tag}`,
      method: 'get',
      authenticated: true
    })

    if (response.data.length === 0) {
      return null
    }

    return response.data[0]
  }
}
