import type { Organization } from '@datagouv/components'

import type { GenericResponse } from './api'

export interface OrganizationResponse extends GenericResponse {
  data: Organization[]
}
