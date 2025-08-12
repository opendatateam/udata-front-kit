import type { DatasetV2 } from '@datagouv/components-next'

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

export type ExtendedDatasetV2 = DatasetV2 & {
  extras: {
    [key: string]: unknown
    dcat?: Record<string, string[] | undefined>
  }
}
