import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { ContactPointRole } from '@datagouv/components-next'

export default class ContactPointAPI extends DatagouvfrAPI {
  endpoint = 'contacts'

  async getRoles(): Promise<ContactPointRole[]> {
    const url = `${this.url()}/roles/`
    return await this.request({
      url,
      method: 'get'
    })
  }
}
