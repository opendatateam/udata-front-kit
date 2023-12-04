import type { SnakeCase } from '@/model/text'

interface Response<T> {
  data?: Data<T>
  status: number
}

interface ResponseParams<T> {
  data?: SnakeCase<Data<T>>
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

interface AppError {
  error: string
  status?: number | string
}

interface HttpError {
  code?: string
  message: string
  request?: unknown
  response?: unknown
  status?: number
}

interface RequestError extends HttpError {
  code: string
  request: Record<string, unknown>
}

interface ResponseError extends HttpError {
  response: {
    data: DataError
    status: number
  }
}

interface DataError {
  message: string
}

type Page = number

export type {
  AppError,
  Data,
  DataError,
  DataParams,
  HttpError,
  Page,
  RequestError,
  Response,
  ResponseError,
  ResponseParams
}
