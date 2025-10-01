import type { Organization, User } from '@datagouv/components-next'
import type { GenericResponse } from './api'

export interface Activity {
  actor: User
  changes: string[]
  created_at: string
  extras: {
    element_id?: string
  }
  icon: string
  key: string
  label: string
  organization: Organization | null
  related_to: string
  related_to_id: string
  related_to_kind: string
  related_to_url: string
}

export interface ActivityResponse extends GenericResponse {
  data: Activity[]
}
