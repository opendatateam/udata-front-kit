import type { ActivityResponse } from '@/model/activity'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class ActivityAPI extends DatagouvfrAPI {
  endpoint = 'activity'

  async getActivitiesForObject(
    objectId: string,
    page: number
  ): Promise<ActivityResponse> {
    return await this.request({
      url: this.url(true),
      method: 'get',
      authenticated: true,
      params: {
        page,
        related_to: objectId
      }
    })
  }
}
