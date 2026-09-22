import type { InjectionKey } from 'vue'
import type { TopicCasUsage, TopicSolution } from '../../model/topics'

export type ArticleTopicEntry = {
  slug: string
  pageKey: 'solutions' | 'cas-d-usages'
  topic: TopicSolution | TopicCasUsage
}

export type ArticleTopicsRegistry = {
  register: (
    slug: string,
    pageKey: 'solutions' | 'cas-d-usages',
    topic: TopicSolution | TopicCasUsage
  ) => void
  entries: Readonly<ArticleTopicEntry[]>
}

export const articleTopicsRegistryKey: InjectionKey<ArticleTopicsRegistry> =
  Symbol('articleTopicsRegistry')
