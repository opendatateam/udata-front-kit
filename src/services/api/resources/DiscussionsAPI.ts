import type {
  AppError,
  Client,
  DataParams,
  Request,
  RequestError,
  Response,
  ResponseError
} from '@/model/api'
import type { Discussion, SubjectId } from '@/model/discussion'
import API from '@/services/api/DatagouvfrAPI'
import { handle } from '@/utils/errors'
import { toCamel } from '@/utils/text'

interface Args {
  baseUrl?: string
  version?: string
  endpoint?: string
  httpClient?: Client
}

interface Params {
  subjectId: SubjectId
  page?: number
  pageSize?: number
}

type Return = Promise<Response<Discussion[]> | AppError>

class DiscussionsAPI extends API {
  endpoint: string = 'discussions'
  page: number = 1
  pageSize: number = 20

  constructor(args: Args = {}) {
    super(args)
    this.endpoint = args.endpoint ?? this.endpoint
  }

  /**
   * Get discussions for a subject.
   */
  public readonly list = async ({
    subjectId,
    page,
    pageSize
  }: Params): Return => {
    page = page ?? this.page
    pageSize = pageSize ?? this.pageSize
    const snakeCased: Record<string, string> = {
      for: subjectId,
      page: String(page),
      page_size: String(pageSize)
    }
    const params: string = new URLSearchParams(snakeCased).toString()
    const url: string = `${this.url()}/?${params}`
    const request: Request<Discussion[]> = this.httpClient<
      DataParams<Discussion[]>
    >({ url })

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
