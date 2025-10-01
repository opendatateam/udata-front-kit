import type { Owned, Rel } from '@datagouv/components-next'

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
  element: {
    class: ElementClass
    id: string
  } | null
}

class ResolvedGenericElement implements GenericElement {
  title!: string
  description!: string | null
  tags!: string[]
  extras!: ElementExtras
  element!: {
    class: ElementClass
    id: string
  } | null

  // those are "local" properties, not stored on data.gouv.fr
  isHidden?: boolean
  remoteDeleted?: boolean
  remoteArchived?: boolean

  // used to compute siteExtras on demand (see getter below)
  readonly siteId: SiteId

  constructor(element: GenericElement, siteId: SiteId) {
    Object.assign(this, element)
    this.siteId = siteId
  }

  // this allow both get and set
  get siteExtras(): SiteElementExtras {
    return this.extras[this.siteId]
  }

  unresolved(): GenericElement {
    // explicitely pick the required attributes for GenericElement
    // const {removeMe, ...element} = this would not trigger type error if removeMe is not enough
    const { title, description, tags, extras, element } = this
    return { title, description, tags, extras, element }
  }
}

export interface Factor extends GenericElement {
  element: {
    class: 'Dataset'
    id: string
  } | null
}

export class ResolvedFactor extends ResolvedGenericElement {
  declare element: Factor['element']

  constructor(factor: Factor, siteId: SiteId) {
    super(factor, siteId)
  }
}

export type FactorsGroups = Map<string, ResolvedFactor[]>

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
  elements?: Factor[]
}
