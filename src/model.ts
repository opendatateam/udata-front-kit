interface DatasetProperties {
  label: string
  purpose: string
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
  datasets: Dataset[]
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

interface Dataset {
  // TODO --  add list of properties for Dataset
}

export const NoOptionSelected = 'no_option_selected'

export type {
  Theme,
  Subtheme,
  SelectOption,
  BreadcrumbItem,
  BetaTopic,
  Topic,
  DatasetProperties
}
