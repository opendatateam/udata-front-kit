import config from '@/config'

import DatagouvfrAPI from './DatagouvfrAPI'
import type { ResponseDataPromise as ResponseData } from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'datasets/search'

  // FIXME: why wrap Promise in Promise? Type it w/ Search anyway
  async search(
    query: string,
    topic: string,
    page: number,
    args?: object
  ): Promise<ResponseData> {
    return await this.request({
      url: this.url(true),
      method: 'get',
      params: {
        topic: topic ?? config.universe.topic_id,
        page: page ?? 1,
        q: query ?? '',
        ...args
      }
    })
  }
}
