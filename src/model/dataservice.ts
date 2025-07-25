import type { Organization } from '@datagouv/components'
import type { GenericResponse } from './api'

export interface DataserviceV2 {
  id: string
  title: string
  description?: string
  organization?: Organization
  tags?: string[]
  created_at: string
  updated_at: string
  uri?: string
  url?: string
  base_api_url?: string
  availability?: number
  is_restricted?: boolean
  contact_point?: {
    id: string
    name: string
    email?: string
    contact_form?: string
    role: string
  }
}

export interface DataserviceV2Response extends GenericResponse {
  data: DataserviceV2[]
}

export type ExtendedDataserviceV2 = DataserviceV2 & {
  extras: {
    [key: string]: unknown
    dcat?: Record<string, string[] | undefined>
  }
}
