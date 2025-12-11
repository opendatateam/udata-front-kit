import type { Resource } from '@datagouv/components-next'
import type { GenericResponse } from './api'

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

export interface ResourceResponse extends GenericResponse {
  data: Resource[]
}

export type { Resource }
