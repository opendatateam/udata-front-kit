import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'

export default class DataservicesAPI extends DatagouvfrAPI {
  endpoint = 'dataservices'

  // dataservices uses api v1 for search since topic filter is not supported on v2
  // this function is for compat with the GenericSearchStore api injection
  async search(query: string, args?: object) {
    return await this.list({
      params: {
        q: query,
        ...args
      }
    })
  }
}
