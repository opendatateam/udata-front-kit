interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
}

interface Subtheme {
  name: string
}

interface Discussion {
  id: string
  title: string
  discussion: {
    posted_by: {
      first_name: string
      last_name: string
    }
    posted_on: string
    content: string
  }[]
}

export type { Theme, Subtheme, Discussion }
