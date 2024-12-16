import type { DatasetV2Response } from '@/model/dataset'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DatasetsAPI extends DatagouvfrAPI {
  endpoint = 'datasets'

  /**
   * Get datasets for an organization
   */
  async getDatasetsForOrganization(
    orgId: string,
    page?: number,
    sort?: string
  ): Promise<DatasetV2Response> {
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
