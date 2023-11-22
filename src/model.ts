interface DatasetItem {
  label: string
  purpose: string
}

export type { DatasetItem }
interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
}

interface Subtheme {
  name: string
}

export type { Theme, Subtheme }
