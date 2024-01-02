import type { DatasetV2Response } from '@/model/dataset'

import DatagouvfrAPI from '../DatagouvfrAPI'

export default class DatasetsAPI extends DatagouvfrAPI {
  endpoint = 'datasets'

  /**
   * Get datasets for an organization
   */
  async getDatasetsForOrganization(
    orgId: string,
    page: number = 1,
    sort: string = '-created'
  ): Promise<DatasetV2Response> {
    // WARNING: specify `-created` or another sort explicitely because default sort has a pagination issue
    const url = `${this.url()}/search/`
    return await this.request({
      url,
      method: 'get',
      params: {
        organization: orgId,
        page,
        sort,
        page_size: 21
      }
    })
  }
}
