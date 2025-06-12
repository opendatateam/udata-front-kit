import type { DataserviceResponse } from '@/model/dataservice'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class DataserviceSearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'dataservices/search'

  async search(query: string, args?: object): Promise<DataserviceResponse> {
    return await this.list({
      params: {
        q: query,
        ...args
      }
    })
  }
}
