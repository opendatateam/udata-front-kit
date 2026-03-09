import type { Activity as DatagouvActivity } from '@datagouv/components-next'

// Extend the datagouv Activity type to support custom activity keys
export interface Activity extends Omit<DatagouvActivity, 'key'> {
  key: string
}
