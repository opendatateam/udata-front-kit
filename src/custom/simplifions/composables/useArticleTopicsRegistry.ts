import { inject, provide, reactive } from 'vue'
import {
  articleTopicsRegistryKey,
  type ArticleTopicEntry,
  type ArticleTopicsRegistry
} from '../components/article/articleTopicsRegistryKey'
import type { TopicCasUsage, TopicSolution } from '../model/topics'

export const provideArticleTopicsRegistry = (): Readonly<
  ArticleTopicEntry[]
> => {
  const entries = reactive<ArticleTopicEntry[]>([])

  const register = (
    slug: string,
    pageKey: 'solutions' | 'cas-d-usages',
    topic: TopicSolution | TopicCasUsage
  ) => {
    if (!entries.some((e) => e.slug === slug)) {
      entries.push({ slug, pageKey, topic })
    }
  }

  provide(articleTopicsRegistryKey, { register, entries })

  return entries
}

export const injectArticleTopicsRegistry = (): ArticleTopicsRegistry | null => {
  return inject(articleTopicsRegistryKey, null)
}
