import DatagouvfrAPI from '../DatagouvfrAPI'
import type ResponseDataPromise from '../DatagouvfrAPI'

export default class DatasetsAPI extends DatagouvfrAPI {
  endpoint = 'datasets'

  /**
   * Get datasets for an organization
   */
  // FIXME: why wrap Promise in Promise? Type it w/ Dataset anyway
  async getDatasetsForOrganization(
    orgId: string,
    page: number = 1,
    sort: string = '-created'
  ): Promise<ResponseDataPromise> {
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
