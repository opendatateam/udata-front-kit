import type { Owned, Rel } from '@etalab/data.gouv.fr-components'

import type { SpatialField } from './spatial'

export enum Availability {
  MISSING = 'missing',
  NOT_AVAILABLE = 'not available',
  LOCAL_AVAILABLE = 'available',
  URL_AVAILABLE = 'url available'
}

export interface DatasetProperties {
  title: string
  purpose: string
  uri: string | null
  id: string | null
  availability: Availability
}

export interface EcospheresTopicExtras {
  cloned_from?: string
}

export interface TopicExtras {
  ['ecospheres:informations']: Array<{
    theme: string
    subtheme: string
  }>
  ['ecospheres:datasets_properties']: DatasetProperties[]
  ecospheres?: EcospheresTopicExtras
}

export type Topic = Owned & {
  name: string
  description: string
  created_at: string
  last_modified: string
  extras: TopicExtras
  featured: boolean
  id: string
  page: string
  private: boolean
  reuses: Rel
  datasets: Rel
  slug: string
  tags: string[]
  uri: string
  spatial: SpatialField | undefined
}

export type TopicPostData = Omit<
  Topic,
  'datasets' | 'reuses' | 'id' | 'slug'
> & {
  id?: string
  slug?: string
  datasets: string[]
  reuses: string[]
}
