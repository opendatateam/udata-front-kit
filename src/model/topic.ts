import type { Owned, Rel } from '@datagouv/components'

import type { SpatialField } from './spatial'

// a placeholder for ecospheres, meteofrance...
// value doesn't really matter, SiteId is used to cast the "real" config value
export type SiteId = 'siteId'

export enum Availability {
  MISSING = 'missing',
  NOT_AVAILABLE = 'not available',
  LOCAL_AVAILABLE = 'available',
  URL_AVAILABLE = 'url available',
  REMOTE_DELETED = 'remote deleted'
}

export interface SiteElementExtras {
  uri: string | null
  availability: Availability
  group?: string
}

export type ElementExtras = Record<SiteId, SiteElementExtras>

export type ElementClass = 'Dataset' | 'Reuse'

export interface GenericElement {
  title: string
  description: string | null
  tags: string[]
  extras: ElementExtras
  element:
    | {
        class: ElementClass
        id: string
      }
    | Record<string, never> // <- this is an empty object
  // those are "local" properties, not stored on data.gouv.fr
  isHidden?: boolean
  remoteDeleted?: boolean
  remoteArchived?: boolean
}

// FIXME: FactorElement?
export interface DatasetElement extends GenericElement {
  element:
    | {
        class: 'Dataset'
        id: string
      }
    | Record<string, never> // <- this is an empty object
}

export type ElementsGroups = Map<string, DatasetElement[]>

export interface SiteTopicExtras {
  cloned_from?: string
}

export type TopicExtras = Record<SiteId, SiteTopicExtras>

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
  elements: Rel
  slug: string
  tags: string[]
  uri: string
  spatial: SpatialField | undefined
}

export type TopicPostData = Omit<Topic, 'elements' | 'id' | 'slug'> & {
  id?: string
  slug?: string
  elements?: DatasetElement[]
}
