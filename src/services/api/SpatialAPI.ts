import type {
  SpatialCoverage,
  SpatialCoverageLevel,
  SpatialCoverageResponse
} from '@/model/spatial'

import DatagouvfrAPI from './DatagouvfrAPI'

export default class SpatialAPI extends DatagouvfrAPI {
  version = 1
  endpoint = 'spatial'

  async suggestZones(query: string, args?: object): Promise<SpatialCoverage[]> {
    return await this.get({
      entityId: 'zones/suggest',
      params: { q: query, ...args }
    })
  }

  async getLevels(): Promise<SpatialCoverageLevel[]> {
    return await this.get({ entityId: 'levels' })
  }

  async getZone(zoneId: string): Promise<SpatialCoverage> {
    const response = (await this.get({
      entityId: `zone/${zoneId}`
    })) as SpatialCoverageResponse
    return {
      id: response.id,
      ...response.properties
    }
  }
}
