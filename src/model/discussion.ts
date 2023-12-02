import type { User } from './user'

interface Discussion {
  discussion: {
    content: string
    posted_by: string
    posted_on: string
  }
  id: string
  subject: Subject
  title: string
  user: User
}

interface Subject {
  class: 'Dataset' | 'Topic'
  id: SubjectId
}

type SubjectId = string

export type { Discussion, SubjectId }
