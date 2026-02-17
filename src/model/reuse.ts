import type { Reuse } from '@datagouv/components-next'

import type { GenericResponse } from './api'

export interface ReuseResponse extends GenericResponse {
  data: Reuse[]
}
