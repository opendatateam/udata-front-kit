import { useHead } from '@unhead/vue'
import type { Ref } from 'vue'
import { toValue } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'

import config from '@/config'
import { stripFromMarkdown } from '@/utils'

type ReactiveInput<T> = Ref<T> | (() => T)

// Google displays ~160 chars; 155 gives a safe margin before it truncates
const META_DESCRIPTION_MAX_LENGTH = 155

export function toMetaDescription(value: string | null | undefined): string {
  if (!value) return ''
  const plain = stripFromMarkdown(value)
  if (plain.length <= META_DESCRIPTION_MAX_LENGTH) return plain
  return plain.slice(0, META_DESCRIPTION_MAX_LENGTH).trimEnd() + '…'
}

function toMetaKeywords(keywords: string[] | undefined): string | undefined {
  return keywords?.length ? keywords.join(', ') : undefined
}

export function useCanonicalUrl(
  getRoute?: () => RouteLocationRaw | null | undefined
): () => string | null {
  const router = useRouter()
  return () => {
    if (!getRoute)
      return `${window.location.origin}${router.currentRoute.value.path}`
    const route = getRoute()
    if (!route) return null
    return `${window.location.origin}${router.resolve(route).href}`
  }
}

export function useMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  noIndex
}: {
  title: ReactiveInput<string | undefined>
  description: ReactiveInput<string | undefined>
  keywords?: ReactiveInput<string[] | undefined>
  canonicalUrl: ReactiveInput<string | undefined | null>
  noIndex?: ReactiveInput<boolean | undefined>
}) {
  const args = {
    meta: () => {
      const t = toValue(title)
      const metaDescription = toMetaDescription(toValue(description))
      const metaKeywords = toMetaKeywords(toValue(keywords))
      return [
        {
          property: 'og:title',
          content: t ? `${t} | ${config.website.title}` : config.website.title
        },
        { name: 'description', content: metaDescription },
        { property: 'og:description', content: metaDescription },
        ...(metaKeywords != null
          ? [{ name: 'keywords', content: metaKeywords }]
          : []),
        ...(toValue(noIndex)
          ? [{ name: 'robots', content: 'noindex, nofollow' }]
          : [])
      ]
    },
    link: () => {
      const url = toValue(canonicalUrl)
      return url ? [{ rel: 'canonical', href: url }] : []
    }
  }
  useHead(args)
}
