import type { SnakeCase } from '@/model/text'

interface Response<T> {
  data: Data<T> | HttpError
  status: number
}

interface ResponseParams<T> {
  data: SnakeCase<T> | HttpError
  status: number
}

interface Data<T> {
  data: T
  page: Page
  pageSize: number
  total: number
}

interface DataParams<T> {
  data: SnakeCase<T>
  page: Page
  pageSize: number
  total: number
}

interface HttpError {
  message: string
}

type Page = number

export type { Data, DataParams, HttpError, Page, Response, ResponseParams }
