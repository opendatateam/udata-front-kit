import type { DatasetV2Response } from '@/model/dataset'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'datasets/search'

  async search(
    query: string,
    topic?: string,
    page: number = 1,
    args?: object
  ): Promise<DatasetV2Response> {
    const params: { [key: string]: any } = {
      q: query,
      page,
      ...args
    }

    if (topic) {
      params.topic = topic
    }

    return await this.list({
      params
    })
  }
}
