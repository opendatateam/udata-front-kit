import { provide, inject } from 'vue'
import {
  articleTopicsRegistryKey,
  type ArticleTopicEntry,
  type ArticleTopicsRegistry
} from '../components/article/articleTopicsRegistryKey'

export const provideArticleTopicsRegistry = (): Readonly<ArticleTopicEntry[]> => {
  const entries = reactive<ArticleTopicEntry[]>([])

  const register = (slug: string, pageKey: 'solutions' | 'cas-d-usages') => {
    if (!entries.some((e) => e.slug === slug)) {
      entries.push({ slug, pageKey })
    }
  }

  provide(articleTopicsRegistryKey, { register, entries })

  return entries
}

export const injectArticleTopicsRegistry = (): ArticleTopicsRegistry | null => {
  return inject(articleTopicsRegistryKey, null)
}
