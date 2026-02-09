import type { Rel, Reuse } from '@datagouv/components-next'

import type { ReuseResponse } from '@/model/reuse'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class ReusesAPI extends DatagouvfrAPI {
  endpoint = 'reuses'

  /**
   * Get reuses for a dataset
   */
  async getReusesForDataset(
    datasetId: string,
    page = 1,
    pageSize = 6
  ): Promise<ReuseResponse> {
    return await this.request({
      url: this.url(true),
      method: 'get',
      params: {
        dataset: datasetId,
        page,
        page_size: pageSize
      }
    })
  }

  async getReusesFromElementsRel(elements: Rel): Promise<Reuse[]> {
    // make sure the request is for reuses only
    const elementsUrl = new URL(elements.href)
    elementsUrl.searchParams.set('class', 'Reuse')
    // fetch paginated reuses elements
    let url = elementsUrl.toString()
    const reusesLinks = []
    while (url) {
      const response = await this.request({
        url: url,
        method: 'get'
      })
      reusesLinks.push(...response.data)
      url = response.next_page
    }
    // fetch reuses from reuses elements
    return await Promise.all(
      reusesLinks.map((link) =>
        this.request({
          url: `${this.url()}/${link.element.id}/`,
          method: 'get'
        })
      )
    )
  }
}
