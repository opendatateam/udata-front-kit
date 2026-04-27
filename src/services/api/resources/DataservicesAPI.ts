import type { DataserviceResponse } from '@/model/dataservice'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DataservicesAPI extends DatagouvfrAPI {
  endpoint = 'dataservices'

  async getDataservicesForDataset(
    datasetId: string,
    page = 1,
    pageSize = 5
  ): Promise<DataserviceResponse> {
    return await this.list({
      params: { dataset: datasetId, page, page_size: pageSize }
    })
  }
}
