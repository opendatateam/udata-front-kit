import type { Dataservice } from '@datagouv/components-next'
import type { GenericResponse } from './api'

// TODO: remove ?
export interface DataserviceV2Response extends GenericResponse {
  data: Dataservice[]
}

// TODO: remove ?
export type ExtendedDataserviceV2 = Dataservice & {
  extras: {
    [key: string]: unknown
    dcat?: Record<string, string[] | undefined>
  }
}
