import type { AppError, RequestError, ResponseError } from '@/model/api'
import { UnknownError } from '@/model/error'

type ErrorType = ResponseError | RequestError | Error

function isResponseError(error: any): error is ResponseError {
  return (
    error.response?.status !== undefined && error.response?.data !== undefined
  )
}

function isRequestError(error: any): error is RequestError {
  return error.code !== undefined && error.request !== undefined
}

const handle = (error: ErrorType): AppError => {
  if (isResponseError(error)) {
    const { status, data } = error.response
    return { status, error: data.message }
  }

  if (isRequestError(error)) {
    const { code, message } = error
    return { status: code, error: message }
  }

  if (error.message !== undefined) {
    throw new UnknownError({ error: error.message })
  }

  throw error
}

export { handle }
