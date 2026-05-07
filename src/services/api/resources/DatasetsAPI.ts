import type { DatasetV2Response } from '@/model/dataset'
import type { ResourceResponse } from '@/model/resource'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DatasetsAPI extends DatagouvfrAPI {
  endpoint = 'datasets'

  /**
   * Get resources for a dataset
   */
  async getResourcesForDataset(
    datasetId: string,
    page: number = 1,
    pageSize: number = 10,
    type: string | null = null,
    q: string | null = null
  ): Promise<ResourceResponse> {
    const url = `${this.url()}/${datasetId}/resources/`
    return await this.request({
      url,
      method: 'get',
      params: {
        q,
        page,
        type,
        page_size: pageSize
      }
    })
  }

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
}
