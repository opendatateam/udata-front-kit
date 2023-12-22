export type GenericData = object[]

export interface GenericResponse {
  data: GenericData
  page: number
  page_size: number
  next_page: string | null
  previous_page: string | null
  total: number
}
