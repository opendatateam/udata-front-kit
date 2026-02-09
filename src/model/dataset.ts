import type { DatasetV2, Harvest } from '@datagouv/components-next'

import type { GenericResponse } from './api'
import type { ResolvedFactor } from './topic'

export type TypedHarvest = Harvest & {
  uri?: string
  remote_url?: string
  created_at?: string
  issued_at?: string
  modified_at?: string
}

export interface DatasetV2Response extends GenericResponse {
  data: DatasetV2[]
}

export interface DatasetModalData {
  index?: number
  factor?: ResolvedFactor
  isValid: boolean
  mode: 'edit' | 'create'
}

export type ExtendedDatasetV2 = DatasetV2 & {
  extras: {
    [key: string]: unknown
    dcat?: Record<string, string[] | undefined>
  }
}
