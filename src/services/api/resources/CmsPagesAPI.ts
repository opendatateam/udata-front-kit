import type { CmsPage } from '@/model/cms'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class CmsPagesAPI extends DatagouvfrAPI {
  endpoint = 'posts'

  async publish(id: string): Promise<CmsPage> {
    return await this.request({
      url: `${this.url()}/${id}/publish/`,
      method: 'post',
      toasted: true,
      authenticated: true
    })
  }

  async unpublish(id: string): Promise<void> {
    return await this.request({
      url: `${this.url()}/${id}/publish/`,
      method: 'delete',
      toasted: true,
      authenticated: true
    })
  }
}
