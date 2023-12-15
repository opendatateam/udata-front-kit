export interface GenericResponse {
  data: object[]
  page: number
  page_size: number
  next_page: string | null
  previous_page: string | null
  total: number
}
