import type {
  DatasetV2,
  DatasetV2WithFullObject,
  Harvest
} from '@datagouv/components-next'

import type { GenericResponse } from './api'
import type { ResolvedFactor } from './topic'

// FIXME: upstream type is Record<string, unknown> for harvest keys (except `backend`)
// we set our own precise types for attributes we need, `unknown` being problematic
export type TypedHarvest = Harvest & {
  uri?: string
  remote_url?: string
  created_at?: string
  issued_at?: string
  modified_at?: string
  source_id?: string
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

// extras written by the DCAT harvester
export type DcatExtras = {
  [key: string]: string | string[] | undefined
  accessRights?: string[]
  provenance?: string[]
  // data.gouv.fr id of the parent dataset
  parent?: string
}

export type ExtendedDatasetV2WithFullObject = DatasetV2WithFullObject & {
  extras: {
    [key: string]: unknown
    dcat?: DcatExtras
  }
  harvest: TypedHarvest | null
}
