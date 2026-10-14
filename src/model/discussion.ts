import type {
  Thread,
  Comment as UpstreamComment
} from '@datagouv/components-next'

import type { GenericResponse } from './api'

interface Discussion extends Thread {
  discussion: Comment[]
  permissions: {
    delete: boolean
    edit: boolean
    close: boolean
  }
  subject: Subject
}

type DiscussionId = string

interface DiscussionForm {
  title: string
  comment: string
  subject: Subject
  extras?: DiscussionExtras
}

interface DiscussionExtras {
  notification?: {
    external_url: string
  }
}

interface Comment extends UpstreamComment {
  id: string
  permissions: {
    delete: boolean
    edit: boolean
  }
}

interface PostForm {
  comment: string
}

interface Subject {
  class: SubjectClass
  id: SubjectId
}

type SubjectClass = 'Dataset' | 'Topic'

type SubjectId = string

interface DiscussionResponse extends GenericResponse {
  data: Discussion[]
}

export type {
  Comment,
  Discussion,
  DiscussionExtras,
  DiscussionForm,
  DiscussionId,
  DiscussionResponse,
  PostForm,
  Subject,
  SubjectClass,
  SubjectId
}
