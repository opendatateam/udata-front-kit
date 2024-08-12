import type { User } from '@datagouv/components'

import type { GenericResponse } from './api'

interface Discussion {
  discussion: Post[]
  id: DiscussionId
  subject: Subject
  title: string
}

type DiscussionId = string

interface DiscussionForm {
  title: string
  comment: string
  subject: Subject
  extras?: {
    notification: {
      external_url: string
      model_name: string
    }
    [key: string]: any
  }
}

interface Post {
  content: string
  posted_by: User
  posted_on: string
}

interface PostForm {
  comment: string
}

interface Subject {
  class: SubjectClass
  id: SubjectId
}

type SubjectClass = 'Dataset' | 'Topic'

enum SubjectClassLabels {
  Dataset = 'jeu de données',
  Topic = 'bouquet'
}

type SubjectId = string

interface DiscussionResponse extends GenericResponse {
  data: Discussion[]
}

export type {
  Discussion,
  Post,
  Subject,
  SubjectId,
  SubjectClass,
  DiscussionResponse,
  DiscussionForm,
  PostForm,
  DiscussionId
}

export { SubjectClassLabels }
