import type { DatasetV2 } from '@etalab/data.gouv.fr-components'

import type { GenericResponse } from './api'

export interface DatasetV2Response extends GenericResponse {
  data: DatasetV2[]
}
