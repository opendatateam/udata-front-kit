import { AxiosError } from 'axios'

import type { HttpError, Response } from '@/model/api'
import { UnknownError } from '@/model/error'

const handle = (error: AxiosError<HttpError> | Error): Response<any[]> => {
  if (error instanceof AxiosError) {
    const { response, request, message }: AxiosError<HttpError> = error
    if (response !== undefined) return response
    if (request !== undefined) return request
    throw new UnknownError({ message })
  }

  throw error
}

export { handle }
