import type { InjectionKey } from 'vue'

export type ArticleTopicEntry = {
  slug: string
  pageKey: 'solutions' | 'cas-d-usages'
}

export const articleTopicsRegistryKey: InjectionKey<
  (slug: string, pageKey: 'solutions' | 'cas-d-usages') => void
> = Symbol('articleTopicsRegistry')
