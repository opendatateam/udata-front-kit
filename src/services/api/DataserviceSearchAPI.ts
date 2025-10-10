import type { DataserviceResponse } from '@/model/dataservice'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class DataserviceSearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'dataservices/search'

  // FIXME: this should not use v2 since topic filter is not supported
  // move to v1 when performance fix is deployed
  async search(query: string, args?: object): Promise<DataserviceResponse> {
    return await this.list({
      params: {
        q: query,
        ...args
      }
    })
  }
}
