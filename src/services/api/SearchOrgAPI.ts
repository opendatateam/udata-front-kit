import { size } from 'lodash'

import type { OrganizationResponse } from '@/model/organization'

import DatagouvfrAPI from './DatagouvfrAPI'

/**
 * A wrapper around search engine API
 */
export default class SearchAPI extends DatagouvfrAPI {
  version = 2
  endpoint = 'organizations/search'

  async search(
    query: string,
    size: number,
    page: number,
    args?: object
  ): Promise<OrganizationResponse> {
    return await this.list({
      params: {
        q: query,
        size: size ?? 20,
        page: page ?? 1,
        ...args
      }
    })
  }
}
