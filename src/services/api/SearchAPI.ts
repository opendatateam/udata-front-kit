import type { DatasetV2 } from '@etalab/data.gouv.fr-components'

import config from '@/config'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'datasets/search'

  async search(
    query: string,
    topic: string,
    page: number,
    args?: object
  ): Promise<DatasetV2[]> {
    return await this.list({
      topic: topic ?? config.universe.topic_id,
      page: page ?? 1,
      q: query ?? '',
      ...args
    })
  }
}
