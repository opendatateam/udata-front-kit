import type { InjectionKey } from 'vue'

export type ArticleTopicEntry = {
  slug: string
  pageKey: 'solutions' | 'cas-d-usages'
}

export type ArticleTopicsRegistry = {
  register: (slug: string, pageKey: 'solutions' | 'cas-d-usages') => void
  entries: Readonly<ArticleTopicEntry[]>
}

export const articleTopicsRegistryKey: InjectionKey<ArticleTopicsRegistry> =
  Symbol('articleTopicsRegistry')
