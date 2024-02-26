import type { AxiosResponse, AxiosError } from 'axios'

export type { AxiosError }

export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'

export interface RequestConfig {
  url: string
  method: HttpMethod
  params?: object
  data?: object
}

export type URLParams = Record<string, string | number>

export type AxiosResponseData = AxiosResponse['data']

export type GenericData = object[]

export interface GenericResponse {
  data: GenericData
  page: number
  page_size: number
  next_page: string | null
  previous_page: string | null
  total: number
}

export interface DatagouvfrAPIArgs {
  baseUrl?: string
  version?: number
  endpoint?: string
}
