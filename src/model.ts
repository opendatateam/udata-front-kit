interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
}

interface Subtheme {
  name: string
}

interface Discussion {
  discussion: {
    content: string
    posted_by: string
    posted_on: string
  }
  id: string
  subject: Subject
  title: string
  user: User
}

interface Subject {
  class: 'Dataset' | 'Topic'
  id: string
}

interface User {
  first_name: string
  last_name: string
}

interface Response<T> {
  status: number
  data?: {
    data: T
    page: number
    page_size: number
    total: number
  }
  error?: {
    message: string
  }
}

interface Pagination {
  label: number
  href: '#'
  title: string
}

type Page<T> = Record<number, T>

type Data<T> = Record<string, Page<T>>

export type { Theme, Subtheme, Discussion, Response, Pagination, Page, Data }
