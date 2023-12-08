interface DatasetProperties {
  label: string
  purpose: string
  uri: string | null
  id: string | null
  availability: string // must be one of Availability value
}

class Availability {
  static MISSING = 'MISSING'
  static NOT_AVAILABLE = 'NOT_AVAILABLE'
  static LOCAL_AVAILABLE = 'LOCAL_AVAILABLE'
  static URL_AVAILABLE = 'URL_AVAILABLE'

  static isAvailable(availability: string) {
    return [
      Availability.LOCAL_AVAILABLE,
      Availability.LOCAL_AVAILABLE
    ].includes(availability)
  }
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

interface Topic {
  name: string
  description: string
  theme: string | undefined
  subtheme: string | undefined
  datasetsProperties: DatasetProperties[]
}

interface BetaTopic {
  created_at: string
  datasets: BetaDataset[]
  description: string
  extras: {
    'ecospheres:datasets_properties': {}
    'ecospheres:informations': { subtheme: string; theme: string }[]
  }
  featured: boolean
  id: string
  name: string
  organisation: any
  owner: any
  page: string
  private: boolean
  reuses: []
  slug: string
  tags: string[]
  uri: string
}

interface BetaDataset {
  create_at: string
  frequency: string
  last_modified: string
  last_update: string

  // TODO --  add list of properties for Dataset
}

export const NoOptionSelected = 'no_option_selected'
export const NoId = 'NO_ID'

export { Availability }
export type {
  Theme,
  Subtheme,
  SelectOption,
  BreadcrumbItem,
  BetaTopic,
  Topic,
  DatasetProperties
}
