import type { AxiosInstance } from 'axios'

import type {
  AppError,
  DataParams,
  Page,
  RequestError,
  Response,
  ResponseError
} from '@/model/api'
import type { Discussion, SubjectId } from '@/model/discussion'
import API from '@/services/api/DatagouvfrAPI'
import { handle } from '@/utils/errors'
import { toCamel } from '@/utils/text'

interface Attrs {
  baseUrl?: string
  version?: string
  endpoint?: string
  httpClient?: AxiosInstance
}

interface Params {
  subjectId: SubjectId
  page?: Page
  pageSize?: number
}

type Return = Promise<Response<Discussion[]> | AppError>

class DiscussionsAPI extends API {
  endpoint = 'discussions'

  constructor(args: Attrs = {}) {
    super(args)
    this.endpoint = args.endpoint ?? this.endpoint
  }

  /**
   * Get discussions for a subject.
   */
  public readonly list = async ({
    subjectId,
    page = 1,
    pageSize = 20
  }: Params): Return => {
    const baseUrl: string = this.url()
    const query: string = `?for=${subjectId}&page=${page}&page_size=${pageSize}`
    const url: string = `${baseUrl}/${query}`
    const request = this.httpClient<DataParams<Discussion[]>>({ url })

    return await request
      .then(
        (response) => {
          const { data, status } = response
          return toCamel({ data, status })
        },
        (error: ResponseError | RequestError | Error) => handle(error)
      )
      .catch((error: ResponseError | RequestError | Error) => handle(error))
  }
}

export { DiscussionsAPI }
