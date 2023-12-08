import type { AxiosInstance, AxiosResponse } from 'axios'

import type { SnakeCase } from '@/model/text'

type Client = AxiosInstance

type Request<T> = Promise<AxiosResponse<DataParams<T>>>

interface Response<T> {
  data?: Data<T>
  status: number
}

interface Data<T> extends Meta {
  data: T
}

interface DataParams<T> extends MetaParams {
  data: SnakeCase<T>
}

interface Meta {
  page: number
  pageSize: number
  total: number
}

interface MetaParams {
  page: number
  page_size: number
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

export type {
  AppError,
  Client,
  Data,
  DataError,
  DataParams,
  Meta,
  Request,
  RequestError,
  Response,
  ResponseError
}
