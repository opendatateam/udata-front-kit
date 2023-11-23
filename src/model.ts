interface Theme {
  name: string
  color: string
  subthemes: Subtheme[]
}

interface Subtheme {
  name: string
}

interface DiscussionRequest {
  title: string,
  comment: string,
  subject: DiscussionSubject,
}

interface DiscussionSubject {
  class: "Topic"
  "id": string
}

export type { Theme, Subtheme, DiscussionRequest }
