import type { Owned, Rel } from '@etalab/data.gouv.fr-components'

import config from '@/config'

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
  // this is a "local" property, not stored on data.gouv.fr
  remoteDeleted?: boolean
}

export interface TopicExtrasToProcess {
  theme: string
  subtheme: string
  datasets_properties: DatasetProperties[]
  cloned_from?: string
}

const extrasToProcess = config.website.topics.extras_to_process as string

interface BaseTopicExtras {
  [key: string]: any
}

export type DynamicTopicExtras = BaseTopicExtras & {
  [key in typeof extrasToProcess]: TopicExtrasToProcess
}

export type Topic = Owned & {
  name: string
  description: string
  created_at: string
  last_modified: string
  extras: DynamicTopicExtras
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
