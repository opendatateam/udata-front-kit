import type { Dataservice } from '@datagouv/components'

import type { GenericResponse } from './api'

export interface DataserviceResponse extends GenericResponse {
  data: Dataservice[]
}
