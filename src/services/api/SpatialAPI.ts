import {
  type SpatialCoverage,
  type SpatialCoverageLevel
} from '@/model/spatial'

import DatagouvfrAPI from './DatagouvfrAPI'

export default class SpatialAPI extends DatagouvfrAPI {
  version = 1
  endpoint = 'spatial'

  async suggestZones(query: string, args?: object): Promise<SpatialCoverage[]> {
    return await this.get('zones/suggest', { q: query, ...args })
  }

  async getLevels(): Promise<SpatialCoverageLevel[]> {
    return await this.get('levels')
  }
}
