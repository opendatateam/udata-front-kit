interface Response<T> {
  status: number
  data?: Data<T>
  error?: Error
}

interface Data<T> {
  data: T
  page: Page
  page_size: number
  total: number
}

type Page = number

interface Error {
  message: string
}

export type { Response, Data, Page }
