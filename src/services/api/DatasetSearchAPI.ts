import type { DatasetV2Response } from '@/model/dataset'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'datasets/search'

  async search(query: string, args?: object): Promise<DatasetV2Response> {
    return await this.list({
      params: {
        q: query,
        ...args
      }
    })
  }
}
