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

export type { Theme, Subtheme, DatasetProperties }
