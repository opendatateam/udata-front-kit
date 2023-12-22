interface DatasetProperties {
  title: string
  purpose: string
  uri: string | null
  id: string | null
  availability: string // must be one of Availability value
}

enum Availability {
  MISSING = 'missing',
  NOT_AVAILABLE = 'not available',
  LOCAL_AVAILABLE = 'available',
  URL_AVAILABLE = 'url available'
}

const isAvailable = (availability: Availability): boolean => {
  return [Availability.LOCAL_AVAILABLE, Availability.URL_AVAILABLE].includes(
    availability
  )
}
interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
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

interface Bouquet {
  name: string
  description: string
  theme: string | undefined
  subtheme: string | undefined
  datasetsProperties: DatasetProperties[]
}

interface BouquetCreationData {
  name: string
  description: string
  datasets: string[] // list of ids (for the dataset which have one)
  tags: string[]
  extras: TopicExtras
}

interface TopicExtras {
  ['ecospheres:informations']: Array<{
    theme: string
    subtheme: string
  }>
  ['ecospheres:datasets_properties']: DatasetProperties[]
}

interface Topic {
  name: string
  description: string
  created_at: string
  extras: TopicExtras
  featured: boolean
  id: string
  organisation: any
  owner: any
  page: string
  private: boolean
  reuses: []
  slug: string
  tags: string[]
  uri: string
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
  BouquetCreationData
}
