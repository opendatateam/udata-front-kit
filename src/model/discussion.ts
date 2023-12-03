import type { User } from './user'

interface Discussion {
  discussion: Post[]
  id: string
  subject: Subject
  title: string
}

interface Post {
  content: string
  postedBy: User
  postedOn: string
}

interface Subject {
  class: 'Dataset' | 'Topic'
  id: SubjectId
}

type SubjectId = string

export type { Discussion, Post, Subject, SubjectId }
