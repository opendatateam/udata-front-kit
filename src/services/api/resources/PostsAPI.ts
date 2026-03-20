import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { Post } from '@datagouv/components-next'

export default class PostsAPI extends DatagouvfrAPI {
  endpoint = 'posts'

  async publish(id: string): Promise<Post> {
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
