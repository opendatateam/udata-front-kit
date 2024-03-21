import type { Owned } from '@etalab/data.gouv.fr-components'

import type { SpatialField } from './spatial'

type WithOwned<T> = T & Owned

interface DatasetProperties {
  title: string
  purpose: string
  uri: string | null
  id: string | null
  availability: Availability
}

enum Availability {
  MISSING = 'missing',
  NOT_AVAILABLE = 'not available',
  LOCAL_AVAILABLE = 'available',
  URL_AVAILABLE = 'url available'
}

// FIXME: no place for this
const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}
interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
  textColor?: string
}

interface Subtheme {
  name: string
}

interface SelectOption {
  value: string
  text: string
  disabled?: boolean
}

interface BreadcrumbItem {
  text: string
  to?: string
}

type Bouquet = Owned & {
  id: string
  name: string
  description: string
  theme: string | undefined
  subtheme: string | undefined
  datasetsProperties: DatasetProperties[]
  spatial: SpatialField | undefined
}

interface BouquetCreationData {
  name: string
  description: string
  private: boolean
  tags: string[]
}

interface BouquetEditionData extends BouquetCreationData {
  datasets: string[] // list of ids (for the dataset which have one)
  extras: TopicExtras
}

interface TopicExtras {
  ['ecospheres:informations']: Array<{
    theme: string
    subtheme: string
  }>
  ['ecospheres:datasets_properties']: DatasetProperties[]
}

type Topic = Owned & {
  name: string
  description: string
  created_at: string
  last_modified: string
  extras: TopicExtras
  featured: boolean
  id: string
  page: string
  private: boolean
  reuses: []
  slug: string
  tags: string[]
  uri: string
  spatial: SpatialField | undefined
}

export const NoOptionSelected = 'no_option_selected'
export const NoId = 'NO_ID'

export { Availability, isAvailable }
export type {
  Theme,
  Subtheme,
  SelectOption,
  BreadcrumbItem,
  Topic,
  Bouquet,
  DatasetProperties,
  BouquetCreationData,
  BouquetEditionData,
  WithOwned
}
