interface DatasetProperties {
  label: string
  purpose: string
  uri: string | null
  availability: Availability
}

// alternative to enum to ensure that no other string is used for
export class Availability {
  static readonly MISSING = new Availability('MISSING')
  static readonly NOT_AVAILABLE = new Availability('NOT_AVAILABLE')
  static readonly ECO_AVAILABLE = new Availability('ECO_AVAILABLE')
  static readonly URL_AVAILABLE = new Availability('URL_AVAILABLE')

  // private to disallow creating other instances of this type
  private constructor(private readonly value: string) {}

  public isAvailable() {
    for (const availability of [
      Availability.URL_AVAILABLE,
      Availability.ECO_AVAILABLE
    ]) {
      if (this.value == availability.value) {
        return true
      }
    }
    return false
  }

  toString() {
    return this.value
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
