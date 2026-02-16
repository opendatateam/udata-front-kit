import type { Organization } from '@datagouv/components-next'

import DatagouvfrAPI from './DatagouvfrAPI'

export default class OrganizationSuggestAPI extends DatagouvfrAPI {
  version = 1
  endpoint = 'organizations/suggest'

  async suggest(
    query: string,
    size: number,
    page?: number,
    args?: object
  ): Promise<Organization[]> {
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
