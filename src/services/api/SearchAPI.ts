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
    topic: string | null,
    page: number,
    args?: object
  ): Promise<DatasetV2Response> {
    return await this.list({
      topic,
      q: query,
      page: page ?? 1,
      ...args
    })
  }
}
