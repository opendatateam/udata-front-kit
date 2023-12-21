import type { Resource } from '@etalab/data.gouv.fr-components'

export interface ResourceType {
  id: string
  label: string
}

export interface ResourceData {
  currentPage: number
  resources: Resource[]
  total: number
  totalWithoutFilter: number
  type: ResourceType
}

export type { Resource }
