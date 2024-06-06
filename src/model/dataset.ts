import type { DatasetV2 } from '@etalab/data.gouv.fr-components'

import type { GenericResponse } from './api'
import type { DatasetProperties } from './topic'

export interface DatasetV2Response extends GenericResponse {
  data: DatasetV2[]
}

export interface DatasetModalData {
  index?: number
  dataset?: DatasetProperties
  isValid: boolean
  mode: 'edit' | 'create'
}

export interface ContactPoint {
  id: string
  name: string
  email: string
}

export type ExtendedDatasetV2 = DatasetV2 & {
  contact_point?: ContactPoint
}
