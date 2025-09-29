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
}
