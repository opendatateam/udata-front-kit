interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
}

interface Subtheme {
  name: string
}

interface Request {
  method: string
  url: string
  data?: Record<string, any>
}

interface Response {
  status: number
  data?: Record<string, any>
  error?: { message: string }
}

interface DiscussionParams {
  title: string
  comment: string
  subject: DiscussionSubject
}

interface DiscussionSubject {
  class: 'Topic'
  id: string
}

interface DiscussionResponse extends Response {
  status: 200 | number
  data?: Partial<DiscussionParams>
}

export type {
  Theme,
  Subtheme,
  Request,
  Response,
  DiscussionParams,
  DiscussionResponse
}
